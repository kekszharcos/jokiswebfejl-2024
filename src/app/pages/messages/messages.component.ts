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
  contentHider = false;
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
  currentChatName : string = '';



  constructor(private messageService: MessageService, private chatService: ChatService, private userService:UserService) {
  }

  ngOnInit(): void {
    this.message.owner = this.loggedInUser.uid;
    this.ownChats = this.chatService.getOwnChats(this.loggedInUser.uid)
    //console.log(this.ownChats)
    this.ownChats.forEach(chat => {
      let usersBro = JSON.parse(chat.users)
      usersBro = usersBro.filter((filter:boolean)=> filter !== this.loggedInUser.uid)
      console.log(usersBro)
      this.userService.getUserById(usersBro[0]).subscribe(value => {
        if (usersBro.length > 1){
          this.friendChats.push([value[0].username+" [Group]",chat.id])
        }else {
          this.friendChats.push([value[0].username,chat.id])
        }
      })
    })
  }

  onSend(chatId:string) {
    this.message.text = this.messageToSend.value
    this.message.chatId = chatId
    this.message.time = new Date().toISOString();
    this.messageService.create(this.message)
    this.messageToSend = new FormControl('')
  }

  openChatWindow(chatId: string, chatName: string) {
    this.chattingWith = chatId;
    this.contentHider = true
    this.messageService.getMessageByChatId(chatId).subscribe(value => {
      this.chatMessages = value
    })
    this.messageToSend = new FormControl('')
    this.currentChatName = chatName

  }

  // refresh(){
  //   window.location.reload();
  // }

  openDrawer() {
    if (this.drawer?.opened){
      this.drawer?.close()
    }else {
      this.drawer?.open()
    }

  }

  addToChat() {
    console.log(this.chatMessages)
    console.log(this.friendChats)
  }

  createNewChat() {

  }
}
