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
import {MatCheckboxChange} from "@angular/material/checkbox";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, DoCheck {
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  @ViewChild('openButton') openButton: any;
  @ViewChild('modBox') modBox: any;
  @ViewChild('userBox') userBox: any;
  loggedInUser = JSON.parse(localStorage.getItem('user') as string);
  messageToSend: FormControl = new FormControl('');
  chosenToAction: FormControl = new FormControl('');
  chosenAction: FormControl = new FormControl('');
  nick: FormControl = new FormControl('');
  ownChats: Chat[] = []
  friendChats: Array<string[]> = []
  showableFriends: Array<string> = []
  chatMessages: Message[] = [];
  message: Message = {id: '', chatId: '', owner: this.loggedInUser.uid, text: '', time: ''}
  usersOfChat = [{id: '', name: '', role: ''}];
  chattingChatId: any = '';
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
    this.differ = this.differs.find([]).create();
  }

  ngOnInit(): void {
    this.message.owner = this.loggedInUser.uid;
    let ss = this.chatService.getOwnChatsObs().subscribe(value => {
      let copy = value;
      for (let i = 0; i < copy.length; i++) {
        let curr = JSON.parse(copy[i].users)
        for (let j = 0; j < curr.length; j++) {
          if (curr[j].id === this.message.owner){
            this.ownChats.push(copy[i])
          }
        }
      }

      for (let i = 0; i < this.ownChats.length; i++) {
        let usersBro = JSON.parse(this.ownChats[i].users)
        let diffBro: any = [];

        if (usersBro.length === 1) {
          for (let j = 0; j < usersBro.length; j++) {
            if (usersBro[j].id === this.loggedInUser.uid) {
              diffBro.push(usersBro[j]);
              break
            }
          }
        } else if (usersBro.length > 1) {
          for (let j = 0; j < usersBro.length; j++) {
            if (usersBro[j].id !== this.loggedInUser.uid) {
              diffBro.push(usersBro[j]);
            }
          }
        }
        if (diffBro.length === 1 && diffBro[0].id === this.loggedInUser.uid) {
          this.friendChats.push([diffBro[0].name + " [Solo chat]", this.ownChats[i].id, diffBro[0].id, diffBro[0].role])
        } else if (diffBro.length === 2 ) {
          this.friendChats.push([diffBro[0].name, this.ownChats[i].id, diffBro[0].id, diffBro[0].role])
        } else if (diffBro.length === 2) {
          this.friendChats.push([diffBro[0].name + " [Group]", this.ownChats[i].id, diffBro[0].id, diffBro[0].role])
        }else {
          this.friendChats.push([diffBro[0].name, this.ownChats[i].id, diffBro[0].id, diffBro[0].role])
        }

      }
      if (localStorage.getItem('currentChat')) {
        let theChat = JSON.parse(localStorage.getItem('currentChat') as string)
        if (theChat !== null){
          this.openChatWindow(theChat.chatId, theChat.name, '')
          this.chosenAction = new FormControl(theChat.what)
          this.addToChatOpen(theChat.chatId)
        }
      }
      ss.unsubscribe()
    })
  }

  onSend(chatId: string) {
    this.message.text = this.messageToSend.value;
    if (this.messageToSend.value.trim() !== "") {
      this.message.chatId = chatId;
      this.message.time = new Date().toISOString();
      this.messageToSend = new FormControl('')
      this.messageService.create(this.message)
    }
  }

  openChatWindow(chatId: string, chatName: string, id: string) {
    this.chatMessages = [];
    this.usersOfChat = [];
    this.addToChatHider = false;
    this.chattingChatId = chatId;
    this.contentHider = true;
    this.loggedInOwnerInGroup = false;
    this.loggedInModInGroup = false;
    let pastC = JSON.parse(localStorage.getItem('currentChat') as string);
    let theChat: any = {chatId: chatId, name: chatName, what: pastC ? pastC.what : ''};
    localStorage.setItem('currentChat', JSON.stringify(theChat));

    for (let i = 0; i < this.ownChats.length; i++) {
      if (this.ownChats[i].id === chatId) {
        let itUsers = JSON.parse(this.ownChats[i].users);
        for (let j = 0; j < itUsers.length; j++) {
          if (itUsers[j].id !== this.loggedInUser.uid && !this.usersOfChat.includes(itUsers[j])) {
            this.usersOfChat.push(itUsers[j])
          }
        }
        break
      }
    }
    for (let i = 0; i < this.ownChats.length; i++) {
      if (this.ownChats[i].id === chatId) {
        let users = JSON.parse(this.ownChats[i].users);
        for (let j = 0; j < users.length; j++) {
          if (users[j].role === "owner" && users[j].id === this.loggedInUser.uid) {
            this.loggedInOwnerInGroup = true;
            break
          } else if (users[j].role === "moderator" && users[j].id === this.loggedInUser.uid) {
            this.loggedInModInGroup = true;
            break
          }
        }
        break
      }
    }
    let un = this.messageService.getMessageByChatId(chatId).subscribe(value => {
      this.chatMessages = [];
      for (let k = 0; k < value.length; k++) {
        let xd = value[k];
        for (let i = 0; i < this.ownChats.length; i++) {
          if (this.ownChats[i].id === chatId) {
            let chatUsers = JSON.parse(this.ownChats[i].users);
            for (let j = 0; j < chatUsers.length; j++) {
              if (chatUsers[j].id === xd.owner) {
                xd.owner = chatUsers[j].name;
                break}}break}}this.chatMessages.push(xd)}});this.currentChatName = chatName}
//csakhogynelegyentöbbmint250SRmeg400CHAR
//Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut
  openDrawer() {if (this.drawer?.opened) {this.drawer?.close()} else {this.drawer?.open()}}

  addToChatOpen(chatId: string) {this.showableFriends = [];switch (this.chosenAction.value) {case 'add':
    let sub = this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {this.friends = JSON.parse(value[0].friends);this.ownChats.forEach(value1 => {if (value1.id === chatId) {let currentChatMembers = JSON.parse(value1.users);for (let i = 0; i < this.friends.length; i++) {
      let includ = false;for (let j = 0; j < currentChatMembers.length; j++) {if (currentChatMembers[j].id === this.friends[i]) {includ = true;break}}if (!includ) {this.showableFriends.push(this.friends[i])}}this.addToChatHider = true;this.addOrChangeNicknameHider = this.changeRoleHider = this.removeFromChatHider = false;sub.unsubscribe()
    }})});break;case 'remove':this.removeFromChatHider = true;this.addOrChangeNicknameHider = this.changeRoleHider = false;break;case 'role':this.changeRoleHider = true;this.addOrChangeNicknameHider = this.removeFromChatHider = false;break;case 'nickname':this.addOrChangeNicknameHider = true;this.changeRoleHider = this.removeFromChatHider = false;break
    }let pastC = JSON.parse(localStorage.getItem('currentChat') as string);let theChat: any = {chatId: pastC.chatId, name: pastC.name, what: pastC.what};theChat.what = this.chosenAction.value;localStorage.setItem('currentChat', JSON.stringify(theChat));this.chosenAction = new FormControl('')}

  chosActionAndExists(currentChatId: string) {return this.chosenToAction.value.trim() !== '' && currentChatId}

  addToChat(currentChatId: string) {if (this.chosActionAndExists(currentChatId)) {
    this.showableFriends = this.showableFriends.filter((fitler: string) => fitler !== this.chosenToAction.value);let iratkozlexd = this.chatService.getChatsById(currentChatId).subscribe(value => {let nele = this.userService.getUserById(this.chosenToAction.value).subscribe(value1 => {
      let modifyableChat = value[0];let pastUsers = JSON.parse(modifyableChat.users);let benneva = false;for (let i = 0; i < pastUsers.length; i++) {if (pastUsers[i].id === this.chosenToAction.value.trim()) {benneva = true;break}}if (!benneva) {pastUsers.push({id: value1[0].id, name: value1[0].username, role: 'user'})
        modifyableChat.users = JSON.stringify(pastUsers);this.chatService.update(modifyableChat).then(_ => {this.chosenToAction = new FormControl('');this.changeRoleHider = this.removeFromChatHider = this.addOrChangeNicknameHider = false;this.addToChatHider = true;nele.unsubscribe();iratkozlexd.unsubscribe();location.reload()})}});})}}

  createNewChat() {
    let chat: Chat;let descri = this.userService.getUserById(this.loggedInUser.uid).subscribe(value => {chat = {id: '', messages: '', users: JSON.stringify([{id: this.loggedInUser.uid, name: value[0].username, role: "owner"}])};this.chatService.create(chat).then(value => {descri.unsubscribe();location.reload();})})}

  deleteChat(chatId: string) {this.chatService.delete(chatId).then(value => {location.reload()})}

  removeUserFromChat(currentChatId: string) {if (this.chosActionAndExists(currentChatId)) {let updatable: Chat = {id: '', users: '', messages: ''};for (let i = 0; i < this.ownChats.length; i++) {if (this.ownChats[i].id === currentChatId) {updatable.id = currentChatId;let curr = JSON.parse(this.ownChats[i].users)
    curr = curr.filter((item: any) => item.id !== this.chosenToAction.value);updatable.users = JSON.stringify(curr);this.ownChats[i].users = JSON.stringify(curr);break}}this.chatService.update(updatable).then(_ => {this.chosenToAction = new FormControl('');location.reload()})}this.addToChatHider = false}

  changeRole(currentChatId: string) {if (this.chosActionAndExists(currentChatId)) {if (this.modBox.checked || this.userBox.checked) {let uns = this.chatService.getChatsById(currentChatId).subscribe(value => {let chat = value[0];let curr = JSON.parse(chat.users);
    for (let i = 0; i < curr.length; i++) {if (this.chosenToAction.value === curr[i].id) {if (this.modBox.checked) {curr[i].role = "moderator"} else if (this.userBox.checked) {curr[i].role = "user"}chat.users = JSON.stringify(curr);uns.unsubscribe();this.chatService.update(chat).then(_ => location.reload());break}}})}}}

  addOrChangeNickname(currentChatId: string) {if (this.chosActionAndExists(currentChatId)) {let uns = this.chatService.getChatsById(currentChatId).subscribe(value => {
    let chat = value[0];let curr = JSON.parse(chat.users);for (let i = 0; i < curr.length; i++) {if (this.chosenToAction.value === curr[i].id) {if (this.nick.value.trim() !== "") {curr[i].name = this.nick.value.trim();chat.users = JSON.stringify(curr);uns.unsubscribe();this.chatService.update(chat).then(_ => location.reload())}break;}}})}}

  ngDoCheck(): void {const changes = this.differ.diff(this.friendChats);if (this.firstRound && changes) {this.drawer?.open()}}

  deleteMessageFromChat(id: string) {this.messageService.delete(id)}}
