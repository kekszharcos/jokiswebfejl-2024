import {Component, DoCheck, IterableDiffer, IterableDiffers, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MessageService} from "../../shared/services/message.service";
import {Message} from "../../shared/models/Message";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {UserService} from "../../shared/services/user.service";
import {MatDrawer} from "@angular/material/sidenav";
import {FriendService} from "../../shared/services/friend.service";
import {Location} from "@angular/common";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, DoCheck {
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  @ViewChild('openButton') openButton: any;
  loggedInUser = JSON.parse(localStorage.getItem('user') as string);
  messageToSend: FormControl = new FormControl('');
  chosenToAction: FormControl = new FormControl('');
  chosenAction: FormControl = new FormControl('');
  ownChats: Chat[] = []
  friendChats: Array<string[]> = []
  showableFriends: Array<string> = []
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
  removeFromChatHider: boolean = false
  changeRoleHider: boolean = false
  addOrChangeNicknameHider: boolean = false
  contentHider: boolean = false;
  firstRound: boolean = true;
  friends: string = '';


  private differ: IterableDiffer<any>;


  constructor(private differs: IterableDiffers, private messageService: MessageService, private chatService: ChatService, private userService: UserService, private friendService: FriendService, private location: Location) {
    //differ és differs ahhoz hogy a drawer gombja kb hamarabb töltsönbe, minthogy a drawer kinyílna, különben rácsúszik a gombra x-x
    this.differ = this.differs.find([]).create();
  }

  ngOnInit(): void {
    this.message.owner = this.loggedInUser.uid;
    let ss = this.chatService.getOwnChatsObs().subscribe(value => {
      this.ownChats = value.filter(chat => JSON.parse(chat.users).includes(this.message.owner));
      for (let i = 0; i < this.ownChats.length; i++) {
        let usersBro = JSON.parse(this.ownChats[i].users)
        if (usersBro.length > 1) {
          usersBro = usersBro.filter((filter: boolean) => filter !== this.loggedInUser.uid)
        }
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
    window.location.reload()
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
    switch (this.chosenAction.value) {
      case 'add':
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
              this.addOrChangeNicknameHider = this.changeRoleHider = this.removeFromChatHider = false
            }
          })
        })

        break
      case 'remove':
        this.removeFromChatHider = true
        this.addOrChangeNicknameHider = this.changeRoleHider = false

        break
      case 'role':
        this.changeRoleHider = true
        this.addOrChangeNicknameHider = this.removeFromChatHider = false
        break
      case 'nickname':
        this.addOrChangeNicknameHider = true
        this.changeRoleHider = this.removeFromChatHider = false
        break
    }

    this.chosenAction = new FormControl('')
  }

  chosActionAndExists(currentChatId:string) {
    return this.chosenToAction.value.trim() !== '' && currentChatId

  }

  addToChat(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      this.showableFriends = this.showableFriends.filter((fitler: string) => fitler !== this.chosenToAction.value)
      let modifyableChat;
      let iratkozlexd = this.chatService.getChatsById(currentChatId).subscribe(value => {
        modifyableChat = value[0]
        let pastUsers = JSON.parse(modifyableChat.users)
        pastUsers.push(this.chosenToAction.value)
        modifyableChat.users = JSON.stringify(pastUsers)

        this.chatService.update(modifyableChat)
        this.chosenToAction = new FormControl('');
        iratkozlexd.unsubscribe()
      })
    }
    this.changeRoleHider = this.removeFromChatHider = this.addOrChangeNicknameHider = false
    this.addToChatHider = true
  }

  createNewChat() {
    let chat = {
      id: '',
      messages: '',
      users: '["' + this.loggedInUser.uid + '"]'
    }
    console.log(chat)

    this.chatService.create(chat).then(value => {
      location.reload()
    })
  }


  deleteChat(chatId: string) {
    this.chatService.delete(chatId).then(value => {
      location.reload()
    })

  }

  usersOfChat: Array<string> = [];
  removeUserFromChat(currentChatId: string) {
    console.log("remove")
    if (this.chosActionAndExists(currentChatId)) {

    }
    this.addToChatHider = true
  }

  changeRole(currentChatId: string) {
    console.log("rol")
    if (this.chosActionAndExists(currentChatId)) {

    }
  }

  addOrChangeNickname(currentChatId: string) {
    console.log("name")
    if (this.chosActionAndExists(currentChatId)) {

    }
  }

  ngDoCheck(): void {
    const changes = this.differ.diff(this.friendChats);
    if (this.firstRound && changes) {
      this.drawer?.open()
    }

  }
}
