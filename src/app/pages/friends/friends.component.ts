import {Component, OnInit} from '@angular/core';
import {FriendService} from "../../shared/services/friend.service";
import {UserService} from "../../shared/services/user.service";
import {ChatService} from "../../shared/services/chat.service";
import {Chat} from "../../shared/models/Chat";
import {Router} from "@angular/router";
import {Friend} from "../../shared/models/Friend";

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrl: './friends.component.scss',
    standalone: false
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
  //friendsRefreshing: boolean = false;
  constructor(private friendService: FriendService, private userService : UserService, private chatService:ChatService, private router: Router) {

  }

  ngOnInit(): void {
    this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
      if (typeof value[0] !== "undefined"){
        this.friends = JSON.parse(value[0].friends)
      }else {
        this.friends = []
      }
      this.refreshFriendUsers();
    })
    this.ownChats = this.chatService.getOwnChats(this.loggedInUser.uid)
  }

  openChat(friendId:string) {
    let breaker = true;
    let lep = this.userService.getUserById(friendId).subscribe(value => {
      let t2 = this.userService.getUserById(this.loggedInUser.uid).subscribe(value2 => {
        this.chat.users = JSON.stringify([{id:this.loggedInUser.uid,name:value2[0].username,role:"owner"},{id:friendId,name:value[0].username,role:"user"}])
        this.ownChats.forEach(chat =>{
          if (chat.users.includes(this.loggedInUser.uid) && chat.users.includes(friendId)){
            breaker = false
          }
        })
        if (breaker){
          this.chatService.create(this.chat).then(_=>{
            this.router.navigateByUrl("/messages")
          })
        }
        t2.unsubscribe()
        lep.unsubscribe()
      })
    })
  }
  removeFriend(friendId: string) {
    // Remove the friend from the local `friends` array
    this.friends = this.friends.filter(r => r !== friendId);

    // Update the backend
    let friend: Friend = {
      user: this.loggedInUser.uid,
      friends: JSON.stringify(this.friends),
    };
    this.friendService.update(friend).then(() => {
      // Recalculate the friendUsers array to update the UI
      this.refreshFriendUsers();
    }).catch(reason => {
      console.error('Error updating friends:', reason);
    });
  }


  private refreshFriendUsers() {
    this.friendUsers = []; // Clear the existing list

    // Re-fetch user data for each friend
    for (let i = 0; i < this.friends.length; i++) {
      let uns = this.userService.getUserById(this.friends[i]).subscribe(value => {
        let breaker = true;

        // Prevent duplicate entries
        for (let j = 0; j < this.friendUsers.length; j++) {
          if (this.friendUsers[j].id === value[0].id) {
            breaker = false;
          }
        }

        if (breaker) {
          this.friendUsers.push({ id: value[0].id, name: value[0].username });
        }
        uns.unsubscribe();
      });
    }
  }
}
