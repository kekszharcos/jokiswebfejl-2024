import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MessageService} from "../../shared/services/message.service";
import {Message} from "../../shared/models/Message";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {UserService} from "../../shared/services/user.service";
import {MatDrawer} from "@angular/material/sidenav";
import {FriendService} from "../../shared/services/friend.service";
import {filter} from "rxjs";

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
    this.ownChats = this.chatService.getOwnChats(this.loggedInUser.uid)
    //console.log(this.ownChats)
    this.ownChats.forEach(chat => {
      let usersBro = JSON.parse(chat.users)
      usersBro = usersBro.filter((filter: boolean) => filter !== this.loggedInUser.uid)
      console.log(usersBro)
      this.userService.getUserById(usersBro[0]).subscribe(value => {
        if (usersBro.length > 1) {
          this.friendChats.push([value[0].username + " [Group]", chat.id])
        } else {
          this.friendChats.push([value[0].username, chat.id])
        }
      })
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

  refresh() {
    window.location.reload();
  }

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
          console.log(this.friends, currentChatMembers, this.showableFriends);

        }
      })
    })


  }

  addToChat() {
    console.log(this.chosenToAdd.value)
    this.showableFriends = this.showableFriends.filter((fitler: string) => filter !== this.chosenToAdd.value)

    this.addToChatHider = true
  }

  createNewChat() {

  }
}
