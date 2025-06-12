import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';
import { Friend } from "../../shared/models/Friend"
import { FormControl } from '@angular/forms';
import { MessageService } from '../../shared/services/message.service';
import { Message } from '../../shared/models/Message';
import { LoadingService } from '../../shared/services/loading.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  loggedInUser: User | null = null;
  friends: Array<Friend> = [];
  ownChats: Array<Chat> = [];
  selectedFriend: Friend | null = null;
  chatMessages: Message[] = [];
  messageToSend = new FormControl('');
  loggedInOwnerInGroup = false;
  loggedInModInGroup = false;
  selectedFriendChatId: string | null = null;
  unsubscribeChats: () => void = () => {};
  unsubscribeMessages: () => void = () => {};
  friendsLoaded = false;
  messagesLoading = false;
  private shouldHideSpinnerAfterScroll = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  private wasScrolledToBottom = true;
  private lastMessagesLength = 0;
  private _scrollListenerAttached = false;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    public loadingService: LoadingService // public for template access
  ) {
    authState(this.authService.auth).subscribe(user => {
      this.loggedInUser = user;
      if (this.loggedInUser) {
        this.friends = [];
        this.friendsLoaded = false;
        this.loadingService.setLoading(true);
        this.userService.getFriends(this.loggedInUser.uid).then(doc => {
          let friendUIDArray = doc.data()!['friends'];
          const friendPromises = friendUIDArray.map((friendUID: string) =>
            this.userService.getUserById(friendUID).then(doc => {
              let valami = doc.data();
              if (valami) {
                this.friends.push({ uid: valami['uid'], username: valami['username'] });
              }
            })
          );
          Promise.all(friendPromises).then(() => {
            this.friendsLoaded = true;
            this.loadingService.setLoading(false);
          });
        });
      }
    });
  }

  ngOnInit() {
    // Only start listening to chats after friends are loaded
    if (this.loggedInUser) {
      this.unsubscribeChats = this.userService.listenToPrivateChats(this.loggedInUser.uid, (chats) => {
        this.ownChats = chats;
      });
    }
  }

  ngAfterViewInit() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.addEventListener('scroll', () => {
        const el = this.messagesContainer.nativeElement;
        this.wasScrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
      });
    }
  }

  ngAfterViewChecked() {
    // Attach scroll listener only if messagesContainer exists and not already attached
    if (this.messagesContainer && !this._scrollListenerAttached) {
      this.messagesContainer.nativeElement.addEventListener('scroll', () => {
        const el = this.messagesContainer.nativeElement;
        this.wasScrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;
      });
      this._scrollListenerAttached = true;
    }

    // Only scroll if new messages arrived
    if (
      this.chatMessages &&
      this.messagesContainer &&
      this.chatMessages.length !== this.lastMessagesLength
    ) {
      this.scrollToBottomIfNeeded();
      this.lastMessagesLength = this.chatMessages.length;
    }

    // Hide spinner only after scroll and DOM update
    if (this.shouldHideSpinnerAfterScroll && this.messagesContainer) {
      setTimeout(() => {
        this.messagesLoading = false;
        this.shouldHideSpinnerAfterScroll = false;
        this.scrollToBottomIfNeeded();
        
      }, 500);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeChats) this.unsubscribeChats();
    if (this.unsubscribeMessages) this.unsubscribeMessages();
  }

  async openChat(friendId: string) {
    if (!this.loggedInUser || !this.friendsLoaded) return;

    // Try to find an existing chat between the two users
    let existingChat: Chat | null = null;
    const chats = await this.userService.getPrivateChats();
    for (const chat of chats) {
      // Assuming your Chat model has uid1 and uid2
      if (
        (chat.uid1 === this.loggedInUser.uid && chat.uid2 === friendId) ||
        (chat.uid2 === this.loggedInUser.uid && chat.uid1 === friendId)
      ) {
        existingChat = chat;
        break;
      }
    }

    if (existingChat) {
      // Chat exists, set selectedFriend and chatId
      this.selectedFriend = this.friends.find(f => f.uid === friendId) || null;
      this.selectedFriendChatId = existingChat.id;
    } else {
      // Chat does not exist, create it and use the generated ID
      const chatData = {
        uid1: this.loggedInUser.uid,
        uid2: friendId,
        messages: []
      };
      //Had to remove Chat type from create to make it work without id field
      const chatDocRef = await this.chatService.create(chatData);
      this.selectedFriend = this.friends.find(f => f.uid === friendId) || null;
      this.selectedFriendChatId = chatDocRef.id;
    }

    // Show spinner while loading messages
    this.messagesLoading = true;
    this.loadMessages(this.selectedFriendChatId);

    // Set up real-time listener
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    this.unsubscribeMessages = this.messageService.listenToMessages(this.selectedFriendChatId, (messages) => {
      this.chatMessages = messages;
      this.shouldHideSpinnerAfterScroll = true; // Wait for scroll before hiding spinner
      // Do NOT set messagesLoading = false here!
    });
  }

  async selectFriend(friend: Friend) {
    if (!this.friendsLoaded) return;
    this.selectedFriend = friend;
    await this.openChat(friend.uid);
    // Do NOT call this.loadMessages here
  }

  loadMessages(chatId: string) {
    this.messagesLoading = true;
    this.messageService.getMessagesByChatId(chatId).then(messagesSnapshot => {
      this.chatMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      // REMOVE this line:
      // this.messagesLoading = false;
    });
  }

  async onSend() {
    if (!this.loggedInUser || !this.selectedFriendChatId) return;
    const text = this.messageToSend.value;
    if (!text || text.trim() === "") return;

    const message = {
      chatId: this.selectedFriendChatId,
      owner: this.loggedInUser.displayName || this.loggedInUser.uid,
      ownerId: this.loggedInUser.uid,
      text: text,
      time: new Date().toISOString()
    };

    this.messageToSend.reset();

    // Use your messageService to add the message to the chat (should use addDoc)
    await this.messageService.create(message);
  }

  deleteMessageFromChat(messageId: string) {

    //might not needed to reload messages after deletion
    this.messageService.delete(messageId).then(() => {
      if (this.selectedFriend) this.loadMessages(this.selectedFriend.uid);
    });
  }

  trackByFriend(index: number, friend: any) {
    return friend.uid;
  }

  trackByMessage(index: number, message: Message) {
    return message.id;
  }

  // Call this after chatMessages update (e.g. in your message listener)
  scrollToBottomIfNeeded() {
    if (this.wasScrolledToBottom && this.messagesContainer) {
      setTimeout(() => {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }

  // Example: in your message listener
  setupMessageListener(chatId: string) {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    this.unsubscribeMessages = this.messageService.listenToMessages(chatId, (messages) => {
      this.chatMessages = messages;
      this.scrollToBottomIfNeeded();
    });
  }
}
