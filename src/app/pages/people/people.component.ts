import { Component, OnInit } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { User, authState } from '@angular/fire/auth';
import { FriendService } from "../../shared/services/friend.service";
import { Friend } from "../../shared/models/Friend";
import { Stranger } from "../../shared/models/User";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrl: './people.component.css',
  standalone: false
})
export class PeopleComponent implements OnInit {
  everyone: Stranger[] = [];
  loggedInUser: User | any = null;
  currentFriends: Array<string> = [];
  itFriends: Array<string> = [];
  friend: Friend = { user: '', friends: [] };
  otherFriend: Friend = { user: '', friends: [] };

  constructor(private userService: UserService, private friendService: FriendService, private authService: AuthService) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
    this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(friends => {
      this.currentFriends = friends
        .map(f => {
          try {
            return f.friends;
          } catch {
            return [];
          }
        })
        .flat();
    });
  }

  ngOnInit(): void {
    this.userService.get().then(snapshot => {
      snapshot.forEach((doc) => {this.everyone.push({uid: doc.data()['uid'], username:  doc.data()['username'], email:  doc.data()['email']})})
    });
  }

  addFriend(friendId: string) {
    if (!this.loggedInUser) return;
    this.itFriends = [];
    if (!this.currentFriends.includes(friendId)) {
      let uns = this.friendService.getOwnFriends(friendId).subscribe(value => {
        if (typeof value[0] === "undefined") {
          this.itFriends = [];
        } else {
          this.itFriends = value[0].friends;
        }

        this.otherFriend.user = friendId;
        this.itFriends.push(this.loggedInUser.uid);
        this.otherFriend.friends = this.itFriends;
        this.friendService.create(this.otherFriend).subscribe({
          error: (reason) => {
            // handle error if needed
          }
        });

        this.currentFriends.push(friendId);
        this.friend.friends = this.currentFriends;
        this.friendService.create(this.friend).subscribe({
          next: () => {
            // After both friend records are created, refresh the friends list
            this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(friends => {
              this.currentFriends = friends
                .map(f => {
                  try {
                    return f.friends;
                  } catch {
                    return [];
                  }
                })
                .flat();
            });
          },
          error: (reason) => {
            // handle error if needed
          }
        });

        uns.unsubscribe();
      });
    }
  }
}
