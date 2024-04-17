import {Component, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/user.service";
import {User} from "../../shared/models/User";
import {FormControl} from "@angular/forms";
import {FriendService} from "../../shared/services/friend.service";
import {Friend} from "../../shared/models/Friend";
import {user} from "@angular/fire/auth";

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
    this.userService.get().subscribe(value => {
      this.everyone = value
      this.everyone = this.everyone.filter(r => this.loggedInUser.uid !== r.id)
      console.log(this.everyone)
    })
    this.friendService.get().subscribe(value => {
      for (let i = 0; i < value.length; i++) {
        if (value[i].user === this.loggedInUser.uid) {
          this.currentFriends = JSON.parse(value[i].friends)
        }
      }
    })
  }

  addFriend(friendId: string) {
    this.itFriends = []
    if (!this.currentFriends.includes(friendId)) {
      this.friendService.get().subscribe(value => {
        for (let i = 0; i < value.length; i++) {
          if (value[i].user === friendId) {
            this.itFriends = JSON.parse(value[i].friends)
          }
        }
      })
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
    }
  }
}
