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
  chatMessages: Message[] = [];
  message: Message = {
    id: '',
    chatId: '',
    owner: this.loggedInUser.uid,
    text: '',
    time: ''
  }
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

      this.ownChats = value.filter(chat => JSON.parse(chat.users).id !== this.message.owner);
      for (let i = 0; i < this.ownChats.length; i++) {
        let usersBro = JSON.parse(this.ownChats[i].users)
        let diffBro = [];
        if (usersBro.length > 1) {
          for (let j = 0; j < usersBro.length; j++) {
            if (usersBro[j].id !== this.loggedInUser.uid) {
              diffBro.push(usersBro[j]);
            }
          }
        }
        if (diffBro.length > 0) {
          if (diffBro.length > 1) {
            this.friendChats.push([diffBro[0].name + " [Group]", this.ownChats[i].id,diffBro[0].id])
          } else {
            this.friendChats.push([diffBro[0].name, this.ownChats[i].id,diffBro[0].id])
          }
        }
        console.log(this.friendChats)

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

  openChatWindow(chatId: string, chatName: string, id: string) {
    this.chatMessages = []
    this.addToChatHider = false
    this.chattingChatId = chatId;
    this.contentHider = true
    console.log(chatName)
    this.messageService.getMessageByChatId(chatId).subscribe(value => {
      console.log(this.ownChats)
/*/UNDERCONSSTTRUCTION/*/
      for (let k = 0; k < value.length; k++) {
        let xd = value[k]
        for (let i = 0; i < this.ownChats.length; i++) {
          if (this.ownChats[i].id === chatId) {
            let chatUsers = JSON.parse(this.ownChats[i].users)
            for (let j = 0; j < chatUsers.length; j++) {

              if (chatUsers[j].id !== xd.owner) {
                xd.owner = chatUsers[j].name
                break
              }

            }

            break
          }
        }

        this.chatMessages.push(xd)
      }
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
        let sub = this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
          this.friends = JSON.parse(value[0].friends)
          this.ownChats.forEach(value1 => {
            if (value1.id === chatId) {
              let currentChatMembers = JSON.parse(value1.users);
              console.log(currentChatMembers)
              for (let i = 0; i < this.friends.length; i++) {
                let includ = false
                for (let j = 0; j < currentChatMembers.length; j++) {
                  if (currentChatMembers[j].id === this.friends[i]) {
                    includ = true;
                    break
                  }
                }
                if (!includ) {
                  this.showableFriends.push(this.friends[i])
                }

              }


              this.addToChatHider = true
              this.addOrChangeNicknameHider = this.changeRoleHider = this.removeFromChatHider = false
              sub.unsubscribe()
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

  chosActionAndExists(currentChatId: string) {
    return this.chosenToAction.value.trim() !== '' && currentChatId

  }

  addToChat(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      console.log(this.showableFriends)
      this.showableFriends = this.showableFriends.filter((fitler: string) => fitler !== this.chosenToAction.value)
      let iratkozlexd = this.chatService.getChatsById(currentChatId).subscribe(value => {
        let nele = this.userService.getUserById(this.chosenToAction.value).subscribe(value1 => {
          let modifyableChat = value[0]
          let pastUsers = JSON.parse(modifyableChat.users)
          pastUsers.push({
            id: value1[0].id,
            name: value1[0].username,
            role: 'user'
          })
          modifyableChat.users = JSON.stringify(pastUsers)

          this.chatService.update(modifyableChat).then(_ => {
            this.chosenToAction = new FormControl('');
            nele.unsubscribe()
          })
        })
        iratkozlexd.unsubscribe()
      })
    }
    this.changeRoleHider = this.removeFromChatHider = this.addOrChangeNicknameHider = false
    this.addToChatHider = true
  }

  createNewChat() {
    let chat: Chat;
    let descri = this.userService.getUserById(this.loggedInUser.uid).subscribe(value => {
      chat = {
        id: '',
        messages: '',
        users: JSON.stringify(
          [{
            id: this.loggedInUser.uid,
            name: value[0].username,
            role: "owner"
          }]
        )
      }
      this.chatService.create(chat).then(value => {
        location.reload()
        console.log(chat)
        descri.unsubscribe()
      })
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
      //console.log(this.loggedInUser.email.split('@')[0])
    }

  }
}
