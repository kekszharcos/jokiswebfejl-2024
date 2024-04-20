import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MessageService} from "../../shared/services/message.service";
import {Message} from "../../shared/models/Message";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {UserService} from "../../shared/services/user.service";
import {MatDrawer} from "@angular/material/sidenav";
import {FriendService} from "../../shared/services/friend.service";
import {filter, window} from "rxjs";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  contentHider = false;
  loggedInUser = JSON.parse(localStorage.getItem('user') as string);
  messageToSend: FormControl = new FormControl<any>('');
  ownChats: Chat[] = []
  friendChats: Array<string[]> = []
  message: Message = {
    id: '',
    chatId: '',
    owner: this.loggedInUser.uid,
    text: '',
    time: ''
  }
  chatMessages: Message[] = [];
  chattingChatId: string = '';
  currentChatName: string = '';
  addToChatHider: boolean = false;
  friends: string = '';
  showableFriends: Array<string> = []
  chosenToAdd: FormControl = new FormControl('');


  constructor(private messageService: MessageService, private chatService: ChatService, private userService: UserService, private friendService: FriendService) {
  }

  ngOnInit(): void {
    this.message.owner = this.loggedInUser.uid;
    let ss = this.chatService.getOwnChatsObs().subscribe(value => {
      this.ownChats = value.filter(chat => JSON.parse(chat.users).includes(this.message.owner));
      for (let i = 0; i < this.ownChats.length; i++) {
        let usersBro = JSON.parse(this.ownChats[i].users)
        usersBro = usersBro.filter((filter: boolean) => filter !== this.loggedInUser.uid)
        let surbs = this.userService.getUserById(usersBro[0]).subscribe(value => {
          if (usersBro.length > 1) {
            this.friendChats.push([value[0].username + " [Group]", this.ownChats[i].id])
          } else {
            this.friendChats.push([value[0].username, this.ownChats[i].id])
          }
          surbs.unsubscribe()
        })
      }
      ss.unsubscribe()
    })
  }

  onSend(chatId: string) {
    this.message.text = this.messageToSend.value
    this.message.chatId = chatId
    this.message.time = new Date().toISOString();
    this.messageService.create(this.message)
    this.messageToSend = new FormControl('')
  }

  openChatWindow(chatId: string, chatName: string) {
    this.addToChatHider = false
    this.chattingChatId = chatId;
    this.contentHider = true
    this.messageService.getMessageByChatId(chatId).subscribe(value => {
      this.chatMessages = value
    })
    this.messageToSend = new FormControl('')
    this.currentChatName = chatName
  }

  /*refresh() {
    window.location.reload();
  }*/

  openDrawer() {
    if (this.drawer?.opened) {
      this.drawer?.close()
    } else {
      this.drawer?.open()
    }
  }

  addToChatOpen(chatId: string) {
    this.showableFriends = []
    this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
      this.friends = JSON.parse(value[0].friends)
      this.ownChats.forEach(value1 => {
        if (value1.id === chatId) {
          let currentChatMembers = JSON.parse(value1.users);
          for (let i = 0; i < this.friends.length; i++) {
            if (!currentChatMembers.includes(this.friends[i])) {
              this.showableFriends.push(this.friends[i])
            }
          }
          this.addToChatHider = true
        }
      })
    })
  }

  addToChat(currentChatId: string) {
    console.log(this.chosenToAdd.value)
    console.log(currentChatId)
    if (this.chosenToAdd.value.trim() !== '') {
      this.showableFriends = this.showableFriends.filter((fitler: string) => fitler !== this.chosenToAdd.value)
    }
    this.addToChatHider = true
  }

  createNewChat() {
    let chat ={
      id: '',
      messages:'[]',
      users:'['+this.loggedInUser.uid+']'
    }
    this.chatService.create(chat)
  }
}
