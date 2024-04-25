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
  loggedInOwnerInGroup: boolean = false;
  loggedInModInGroup: boolean = false;
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
        let diffBro:any = [];

        //the beggining of problems start here
        if (usersBro.length === 1) {
          for (let j = 0; j < usersBro.length; j++) {
            if (usersBro[j].id === this.loggedInUser.uid) {
              diffBro.push(usersBro[j]);
              break
            }
          }
        }else if (usersBro.length > 1) {
          for (let j = 0; j < usersBro.length; j++) {
            console.log('j-ed',usersBro[j])
            if (usersBro[j].id !== this.loggedInUser.uid) {
              diffBro.push(usersBro[j]);
            }
          }
        }
        if (diffBro.length === 1 && diffBro[0].id === this.loggedInUser.uid) {
          this.friendChats.push([diffBro[0].name+ " [Solo chat]", this.ownChats[i].id , diffBro[0].id, diffBro[0].role])
        }else if (diffBro.length > 1) {
          this.friendChats.push([diffBro[0].name + " [Group]", this.ownChats[i].id, diffBro[0].id,diffBro[0].role])
        } else {
          this.friendChats.push([diffBro[0].name, this.ownChats[i].id, diffBro[0].id, diffBro[0].role])
        }
      }
      ss.unsubscribe()
    })
  }

  onSend(chatId: string) {
    this.message.text = this.messageToSend.value
    if (this.messageToSend.value.trim() !== "") {
      this.message.chatId = chatId
      this.message.time = new Date().toISOString();
      this.messageService.create(this.message)
      this.messageToSend = new FormControl('')
    }
  }

  openChatWindow(chatId: string, chatName: string, id: string) {
    this.chatMessages = []
    this.usersOfChat = []
    this.addToChatHider = false
    this.chattingChatId = chatId;
    this.contentHider = true
    this.loggedInOwnerInGroup = false;
    this.loggedInModInGroup = false;

    for (let i = 0; i < this.ownChats.length; i++) {
      if (this.ownChats[i].id === chatId) {
        let users = JSON.parse(this.ownChats[i].users)
        for (let j = 0; j < users.length; j++) {
          if (users[j].role === "owner" && users[j].id === this.loggedInUser.uid) {
            this.loggedInOwnerInGroup = true;
            break
          } else if (users[j].role === "moderator" && users[j].id === this.loggedInUser.uid) {
            this.loggedInModInGroup = true
            break
          }
        }
        break
      }
    }
    this.messageService.getMessageByChatId(chatId).subscribe(value => {
      this.chatMessages = []
      //console.log(this.ownChats)
      /*/UNDERCONSSTTRUCTION/*/
      for (let k = 0; k < value.length; k++) {
        let xd = value[k]
        //console.log(k+"-ad k", xd)
        for (let i = 0; i < this.ownChats.length; i++) {
          if (this.ownChats[i].id === chatId) {
            // console.log(i+"-ed e", this.ownChats[i].id,chatId)
            let chatUsers = JSON.parse(this.ownChats[i].users)
            for (let j = 0; j < chatUsers.length; j++) {
              if (chatUsers[j].id === xd.owner) {
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


    this.currentChatName = chatName
  }

  openDrawer() {
    if (this.drawer?.opened) {
      this.drawer?.close()
    } else {
      this.drawer?.open()
    }
  }

  usersOfChat = [{
    id: '',
    name: '',
    role: ''
  }];

  addToChatOpen(chatId: string) {
    this.showableFriends = []
    this.usersOfChat = []
    for (let i = 0; i < this.ownChats.length; i++) {
      if (this.ownChats[i].id === chatId) {
        let itUsers = JSON.parse(this.ownChats[i].users)
        for (let j = 0; j < itUsers.length; j++) {
          if (itUsers[j].id !== this.loggedInUser.uid) {
            this.usersOfChat.push(itUsers[j])
          }
        }
      }
    }
    switch (this.chosenAction.value) {
      case 'add':
        let sub = this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
          this.friends = JSON.parse(value[0].friends)
          this.ownChats.forEach(value1 => {
            if (value1.id === chatId) {
              let currentChatMembers = JSON.parse(value1.users);
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
        descri.unsubscribe()
      })
    })


  }


  deleteChat(chatId: string) {
    this.chatService.delete(chatId).then(value => {
      location.reload()
    })

  }


  removeUserFromChat(currentChatId: string) {
    if (this.chosActionAndExists(currentChatId)) {
      let updatable: Chat = {
        id: '',
        users: '',
        messages: ''
      };
      console.log("remove")
      for (let i = 0; i < this.ownChats.length; i++) {
        if (this.ownChats[i].id === currentChatId) {
          updatable.id = currentChatId;
          let curr = JSON.parse(this.ownChats[i].users)
          curr = curr.filter((item: any) => item.id !== this.chosenToAction.value)
          updatable.users = JSON.stringify(curr)
          console.log(updatable)
          this.ownChats[i].users = JSON.stringify(curr)
          console.log(this.ownChats[i].users)
          break
        }
      }
      this.chatService.update(updatable).then(_ => this.chosenToAction = new FormControl(''))
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

  deleteMessageFromChat(id: string) {
    this.messageService.delete(id)
  }
}
