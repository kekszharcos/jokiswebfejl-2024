import { Component, DoCheck, IterableDiffer, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { FormControl } from "@angular/forms";
import { MessageService } from "../../shared/services/message.service";
import { Message } from "../../shared/models/Message";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { UserService } from "../../shared/services/user.service";
import { MatDrawer } from "@angular/material/sidenav";
import { Location } from "@angular/common";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  standalone: false
})
export class MessagesComponent implements OnInit, DoCheck {
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  @ViewChild('openButton') openButton: any;
  @ViewChild('modBox') modBox: any;
  @ViewChild('userBox') userBox: any;

  loggedInUser: User | null = null;
  messageToSend: FormControl = new FormControl('');
  chosenToAction: FormControl = new FormControl('');
  chosenAction: FormControl = new FormControl('');
  nick: FormControl = new FormControl('');
  ownChats: Chat[] = [];
  friendChats: Array<string[]> = [];
  showableFriends: string[] = [];
  chatMessages: Message[] = [];
  usersOfChat: { id: string, name: string, role: string }[] = [];
  chattingChatId: string = '';
  currentChatName: string = '';
  addToChatHider: boolean = false;
  removeFromChatHider: boolean = false;
  changeRoleHider: boolean = false;
  addOrChangeNicknameHider: boolean = false;
  contentHider: boolean = false;
  loggedInOwnerInGroup: boolean = false;
  loggedInModInGroup: boolean = false;
  firstRound: boolean = true;
  friends: string[] = [];
  currentChatSaved: { chatId: string, name: string, what: string } = { chatId: '', name: '', what: '' };

  private differ: IterableDiffer<any>;

  constructor(
    private differs: IterableDiffers,
    private messageService: MessageService,
    private chatService: ChatService,
    private userService: UserService,
    private location: Location,
    private authService: AuthService
  ) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
    this.differ = this.differs.find([]).create();
  }

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats() {
    if(!this.loggedInUser) return;
    this.chatService.getOwnChats(this.loggedInUser.uid).subscribe(chats => {
      this.ownChats = chats;
      this.friendChats = [];
      for (let chat of this.ownChats) {
        const users = chat.users;
        const myUser = users.find(u => u.id === this.loggedInUser!.uid);
        const others = users.filter(u => u.id !== this.loggedInUser!.uid);
        if (users.length === 1 && myUser) {
          this.friendChats.push([myUser.name + " [Solo chat]", chat.id, myUser.id, myUser.role]);
        } else if (others.length === 1) {
          this.friendChats.push([others[0].name, chat.id, others[0].id, others[0].role]);
        } else if (others.length > 1) {
          this.friendChats.push([others[0].name + " [Group]", chat.id, others[0].id, others[0].role]);
        } else {
          this.friendChats.push([others[0]?.name || '', chat.id, others[0]?.id || '', others[0]?.role || '']);
        }
      }
      // Restore chat state from memory if needed
      if (this.currentChatSaved.chatId) {
        this.openChatWindow(this.currentChatSaved.chatId, this.currentChatSaved.name, '');
        this.chosenAction.setValue(this.currentChatSaved.what);
        this.addToChatOpen(this.currentChatSaved.chatId);
      }
    });
  }

  onSend(chatId: string) {
    if (!this.loggedInUser) return;
    const text = this.messageToSend.value;
    if (!text || text.trim() === "") return;

    // Find the chat
    const chat = this.ownChats.find(c => c.id === chatId);
    if (!chat) return;

    // Check if the user is a member of the chat
    const isMember = chat.users.some(u => u.id === this.loggedInUser!.uid);
    if (!isMember) return; // Not a member, do not send

    const message: Message = {
      id: '',
      chatId: chatId,
      owner: this.loggedInUser.uid,
      text: text,
      time: new Date().toISOString()
    };
    this.messageToSend.reset();
    this.messageService.create(message).subscribe();
  }

  openChatWindow(chatId: string, chatName: string, id: string) {
    if(!this.loggedInUser) return;
    this.chatMessages = [];
    this.usersOfChat = [];
    this.chattingChatId = chatId;
    this.contentHider = true;
    this.loggedInOwnerInGroup = false;
    this.loggedInModInGroup = false;

    // Save chat state in memory
    let theChat: any = { chatId: chatId, name: chatName, what: this.currentChatSaved ? this.currentChatSaved.what : '' };
    if (this.currentChatSaved && chatId !== this.currentChatSaved.chatId) {
      theChat.what = '';
      this.addToChatHider = this.changeRoleHider = this.removeFromChatHider = this.addOrChangeNicknameHider = false;
    }
    this.currentChatSaved = theChat;

    // Find chat and users
    const chat = this.ownChats.find(c => c.id === chatId);
    if (!chat) return;

    this.usersOfChat = chat.users.filter(u => u.id !== this.loggedInUser!.uid);

    chat.users.forEach(u => {
      if (u.id === this.loggedInUser!.uid && u.role === "owner") this.loggedInOwnerInGroup = true;
      if (u.id === this.loggedInUser!.uid && u.role === "moderator") this.loggedInModInGroup = true;
    });

    this.messageService.getMessageByChatId(chatId).subscribe(messages => {
      this.chatMessages = messages.map(msg => {
        const user = chat.users.find(u => u.id === msg.owner);
        return { ...msg, owner: user ? user.name : msg.owner };
      });
    });

    this.currentChatName = chatName;
  }

  addToChatOpen(chatId: string) {
    if(!this.loggedInUser) return;
    this.showableFriends = [];
    switch (this.chosenAction.value) {
      case 'add':
        /*this.userService.getFriends(this.loggedInUser.uid).subscribe(value => {
          this.friends = value[0]?.friends ?? [];
          const chat = this.ownChats.find(c => c.id === chatId);
          if (!chat) return;
          const currentChatMembers = chat.users;
          this.showableFriends = this.friends.filter(fid =>
            !currentChatMembers.some(u => u.id === fid)
          );
          this.addToChatHider = true;
          this.addOrChangeNicknameHider = this.changeRoleHider = this.removeFromChatHider = false;
        });*/
        break;
      case 'remove':
        this.removeFromChatHider = true;
        this.addOrChangeNicknameHider = this.changeRoleHider = this.addToChatHider = false;
        break;
      case 'role':
        this.changeRoleHider = true;
        this.addOrChangeNicknameHider = this.removeFromChatHider = this.addToChatHider = false;
        break;
      case 'nickname':
        this.addOrChangeNicknameHider = true;
        this.changeRoleHider = this.removeFromChatHider = this.addToChatHider = false;
        break;
    }
    // Update current chat state in memory
    let theChat: any = { chatId: this.currentChatSaved.chatId, name: this.currentChatSaved.name, what: this.currentChatSaved.what };
    theChat.what = this.chosenAction.value;
    this.currentChatSaved = theChat;
    this.chosenAction.reset();
  }

  chosActionAndExists(currentChatId: string) {
    return this.chosenToAction.value && this.chosenToAction.value.trim() !== '' && currentChatId;
  }

  addToChat(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      this.showableFriends = this.showableFriends.filter(f => f !== this.chosenToAction.value);
      this.chatService.getChatsById(currentChatId).subscribe(value => {
        /*this.userService.getUserById(this.chosenToAction.value).subscribe(value1 => {
          let chat = value[0];
          let benneva = chat.users.some((u: any) => u.id === this.chosenToAction.value.trim());
          if (!benneva) {
            chat.users.push({ id: value1[0].uid, name: value1[0].displayName!, role: 'user' });
            this.chatService.update(chat).subscribe(() => {
              this.chosenToAction.reset();
              this.changeRoleHider = this.removeFromChatHider = this.addOrChangeNicknameHider = false;
              this.addToChatHider = true;
              this.loadChats();
            });
          }
        });*/
      });
    }
  }

  createNewChat() {
    if(!this.loggedInUser) return;
    /*this.userService.getUserById(this.loggedInUser.uid).subscribe(value => {
      const chat: Chat = {
        id: '',
        messages: [],
        users: [{ id: this.loggedInUser!.uid, name: value[0].displayName!, role: "owner" }]
      };
      this.chatService.create(chat).subscribe(() => {
        this.loadChats();
      });
    });*/
  }

  deleteChat(chatId: string) {
    this.chatService.delete(chatId).subscribe(() => {
      // No localStorage usage!
      this.currentChatSaved = { chatId: '', name: '', what: '' }; // Reset in-memory state if needed
      this.loadChats();
    });
  }

  removeUserFromChat(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      const chat = this.ownChats.find(c => c.id === currentChatId);
      if (!chat) return;
      chat.users = chat.users.filter(u => u.id !== this.chosenToAction.value);
      this.chatService.update(chat).subscribe(() => {
        this.chosenToAction.reset();
        this.loadChats();
      });
      this.addToChatHider = false;
    }
  }

  changeRole(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      if (this.modBox.checked || this.userBox.checked) {
        this.chatService.getChatsById(currentChatId).subscribe(value => {
          let chat = value[0];
          for (let i = 0; i < chat.users.length; i++) {
            if (this.chosenToAction.value === chat.users[i].id) {
              chat.users[i].role = this.modBox.checked ? "moderator" : "user";
              this.chatService.update(chat).subscribe(() => this.loadChats());
              break;
            }
          }
        });
      }
    }
  }

  addOrChangeNickname(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      this.chatService.getChatsById(currentChatId).subscribe(value => {
        let chat = value[0];
        for (let i = 0; i < chat.users.length; i++) {
          if (this.chosenToAction.value === chat.users[i].id) {
            if (this.nick.value.trim() !== "") {
              chat.users[i].name = this.nick.value.trim();
              this.chatService.update(chat).subscribe(() => this.loadChats());
            }
            break;
          }
        }
      });
    }
  }

  ngDoCheck(): void {
    const changes = this.differ.diff(this.friendChats);
    if (this.firstRound && changes) {
      this.drawer?.open();
    }
  }

  deleteMessageFromChat(id: string) {
    this.messageService.delete(id).subscribe();
  }

  // For friendChats (use unique id or index)
  trackByFn(index: number, item: any): any {
    // If friendName[1] is a unique id, use it:
    return item[1];
    // Or just use index if no unique id:
    // return index;
  }

  // For chatMessages (use unique message id)
  trackByMessage(index: number, message: any): any {
    return message.id; // or whatever uniquely identifies a message
  }
}
