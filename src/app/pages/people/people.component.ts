import { Component, OnInit } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { User, authState } from '@angular/fire/auth';
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

  constructor(private userService: UserService, private authService: AuthService) {
    authState(this.authService.auth).subscribe(user => {this.loggedInUser = user 
      if (this.loggedInUser){
        this.userService.getFriends(this.loggedInUser.uid).then(doc => {
          this.currentFriends = doc.data()!['friends'];
        });
      }
    });
  }

  ngOnInit(): void {
    this.userService.get().then(snapshot => {
      snapshot.forEach((doc) => {if(doc.data()['username'] !== this.loggedInUser.displayName) { this.everyone.push({uid: doc.data()['uid'], username:  doc.data()['username'], email:  doc.data()['email']})}})
    });
  }

  addFriend(friendId: string) {
    if (!this.loggedInUser) return;
    if (!this.currentFriends.includes(friendId)) {
      this.userService.addFriend(this.loggedInUser.uid, friendId).then(() => {
          this.userService.addFriend(friendId, this.loggedInUser.uid).then();
      })
      this.currentFriends.push(friendId);
    }
  }
}
