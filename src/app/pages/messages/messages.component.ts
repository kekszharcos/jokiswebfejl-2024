import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MessageService} from "../../shared/services/message.service";
import {Message} from "../../shared/models/Message";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {UserService} from "../../shared/services/user.service";
import {MatDrawer} from "@angular/material/sidenav";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  hider = false;
  loggedInUser = JSON.parse(localStorage.getItem('user') as string);
  messageToSend: FormControl = new FormControl<any>('');
  ownChats: Chat[] = []
  friendChats:Array<string[]> = []
  message: Message = {
    id: '',
    chatId: '',
    owner: this.loggedInUser.uid,
    text: '',
    time: ''
  }
  chatMessages: Message[] = [];
  chattingWith: string ='';

  constructor(private messageService: MessageService, private chatService: ChatService, private userService:UserService) {

  }

  ngOnInit(): void {
    this.message.owner = this.loggedInUser.uid;
    this.ownChats = this.chatService.getOwnChats(this.loggedInUser.uid)
    this.chatService.getOwnChatsObs().subscribe(value => {
      this.ownChats = value.filter(chat => JSON.parse(chat.users).includes(this.loggedInUser.uid));
    })
    //console.log(this.ownChats)
    this.ownChats.forEach(chat => {
      let usersBro = JSON.parse(chat.users)
      if (usersBro.includes(this.loggedInUser.uid)){
        for (let i = 0; i < usersBro.length; i++) {
          if (usersBro[i] !== this.loggedInUser.uid){
            this.userService.getUserById(usersBro[i]).subscribe(value => {
              this.friendChats.push([value[0].username,chat.id])

            })
          }
        }

      }
    })
  }

  onSend(chatId:string) {
    this.message.text = this.messageToSend.value
    this.message.chatId = chatId
    this.message.time = new Date().toISOString();
    this.messageService.create(this.message)
  }

  openChatWindow(string: string) {
    this.chattingWith = string;
    this.hider = !this.hider
    this.messageService.getMessageByChatId(string).subscribe(value => {
      this.chatMessages = value
      console.log(this.chatMessages)
    })

  }

  // refresh(){
  //   window.location.reload();
  // }
  openDrawer() {
    this.drawer?.close()
  }

  addToChat() {

  }

  createNewChat() {

  }
}
