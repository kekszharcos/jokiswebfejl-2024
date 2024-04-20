import {Component, OnInit} from '@angular/core';
import {FriendService} from "../../shared/services/friend.service";
import {UserService} from "../../shared/services/user.service";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit{
  friends: Array<string> = []
  loggedInUser = JSON.parse(localStorage.getItem('user') as string) ;
  friendUsers: Array<any> =[];
  chat: Chat ={
    id:'',
    users:'',
    messages:''
  }
  ownChats: Array<Chat> = [];
  constructor(private friendService: FriendService, private userService : UserService, private chatService:ChatService, private afs: AngularFirestore) {

  }

  ngOnInit(): void {
    this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
      this.friends = JSON.parse(value[0].friends)
      for (let i = 0; i < this.friends.length; i++) {
        this.userService.getUserById(this.friends[i]).subscribe(value => {
          let breaker = true;
          for (let j = 0; j < this.friendUsers.length; j++) {
            if (this.friendUsers[j].id === value[0].id){
              breaker = false
            }
          }
          if (breaker){
            this.friendUsers.push({id:value[0].id,name:value[0].username})
          }
        })
      }

    })
    this.ownChats = this.chatService.getOwnChats(this.loggedInUser.uid)
  }

  openChat(friendId:string) {
    let breaker = true;
    this.chat.users = JSON.stringify([this.loggedInUser.uid,friendId])
    this.ownChats.forEach(chat =>{
      if (chat.users.includes(this.loggedInUser.uid) && chat.users.includes(friendId)){
        breaker = false
      }
    })
    if (breaker){
      //console.log(this.ownChats)
      this.chatService.create(this.chat)
    }/*else {
      console.log("vanmar teee")
    }*/
  }
}
