import {Component, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/user.service";
import {User} from "../../shared/models/User";
import {FriendService} from "../../shared/services/friend.service";
import {Friend} from "../../shared/models/Friend";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent implements OnInit {
  everyone: User[] = [];
  loggedInUser = JSON.parse(localStorage.getItem('user') as string);
  currentFriends: Array<string> = []
  itFriends: Array<string> = []
  friend: Friend = {
    user: this.loggedInUser.uid,
    friends: ''
  }
  otherFriend: Friend = {
    user: '',
    friends: ''
  }

  constructor(private userService: UserService, private friendService: FriendService) {
  }

  ngOnInit(): void {
    let una =this.userService.get().subscribe(value => {
      this.everyone = value
      this.everyone = this.everyone.filter(r => this.loggedInUser.uid !== r.id)
      console.log(this.everyone)
      una.unsubscribe()
    })
    let un = this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(value => {
      this.currentFriends = JSON.parse(value[0].friends)
      un.unsubscribe()
    })
  }

  addFriend(friendId: string) {
    this.itFriends = []
    if (!this.currentFriends.includes(friendId)) {
      let uns = this.friendService.getOwnFriends(friendId).subscribe(value => {

        if (typeof value[0] === "undefined"){
          this.itFriends = []
        }else {
          console.log(value[0])
          this.itFriends = JSON.parse(value[0].friends)
        }


        this.otherFriend.user = friendId;
        this.itFriends.push(this.loggedInUser.uid)
        this.otherFriend.friends = JSON.stringify(this.itFriends)
        this.friendService.create(this.otherFriend)
          .catch(reason => {
            console.log(reason)
          })
        this.currentFriends.push(friendId)
        this.friend.friends = JSON.stringify(this.currentFriends)
        this.friendService.create(this.friend)
          .catch(reason => {
            console.log(reason)
          })
        localStorage.setItem('friends', JSON.stringify(this.currentFriends))
        uns.unsubscribe()
      })
    }
  }
}
