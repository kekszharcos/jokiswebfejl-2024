import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent implements OnInit, OnDestroy {
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

  constructor(private userService: UserService, private chatService: ChatService, private router: Router, private authService: AuthService, private messageService: MessageService) {
    authState(this.authService.auth).subscribe(user => {this.loggedInUser = user
      if (this.loggedInUser){
        this.userService.getFriends(this.loggedInUser.uid).then(doc => {
          let friendUIDArray = doc.data()!['friends'];
          for (let friendUID of friendUIDArray) {
            this.userService.getUserById(friendUID).then((doc) => {
              let valami = doc.data();
              if(valami) {
                this.friends.push({ uid: valami['uid'], username: valami['username']});
              }
            })
          }
        });
      }
    });
  }

  ngOnInit() {
    if (this.loggedInUser) {
      this.unsubscribeChats = this.userService.listenToPrivateChats(this.loggedInUser.uid, (chats) => {
        this.ownChats = chats;
      });
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeChats) this.unsubscribeChats();
    if (this.unsubscribeMessages) this.unsubscribeMessages();
  }

  async openChat(friendId: string) {
    if (!this.loggedInUser) return;

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
      this.loadMessages(existingChat.id);
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
      this.loadMessages(chatDocRef.id);
    }

    // When opening a chat:
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    this.unsubscribeMessages = this.messageService.listenToMessages(this.selectedFriendChatId, (messages) => {
      this.chatMessages = messages;
    });
  }

  async selectFriend(friend: Friend) {
    this.selectedFriend = friend;
    await this.openChat(friend.uid);
    // Do NOT call this.loadMessages here
  }

  loadMessages(chatId: string) {
    this.messageService.getMessagesByChatId(chatId).then(messagesSnapshot => {
      this.chatMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
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

    // Reload messages
    this.loadMessages(this.selectedFriendChatId);
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
}
