import { Component, OnInit } from '@angular/core';
import { FriendService } from "../../shared/services/friend.service";
import { UserService } from "../../shared/services/user.service";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';


@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent implements OnInit {
  friends: Array<string> = [];
  loggedInUser: User | null = null;
  friendUsers: Array<any> = [];
  chat: Chat = {
    id: '',
    users: [],
    messages: []
  };
  ownChats: Array<Chat> = [];

  constructor(
    private friendService: FriendService,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService
  ) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
  }

  ngOnInit(): void {
    if (!this.loggedInUser) return;
    this.friendService.getOwnFriends(this.loggedInUser.uid).subscribe(friends => {
      if (friends[0] && Array.isArray(friends[0].friends)) {
        this.friends = friends[0].friends;
      } else {
        this.friends = [];
      }
    });
    
  }

  openChat(friendId: string) {
    if (!this.loggedInUser) return;
    let breaker = true;
    let lep = this.userService.getUserById(friendId).subscribe(value => {
      let t2 = this.userService.getUserById(this.loggedInUser!.uid).subscribe(value2 => {
        this.chat.users = [
          { id: this.loggedInUser!.uid, name: value2[0].displayName!, role: "owner" },
          { id: friendId, name: value[0].displayName!, role: "user" }
        ];
        this.ownChats.forEach(chat => {
          if (
            chat.users.some(u => u.id === this.loggedInUser!.uid) &&
            chat.users.some(u => u.id === friendId)
          ) {
            breaker = false;
          }
        });
        if (breaker) {
          this.chatService.create(this.chat).subscribe({
            next: _ => {
              this.router.navigateByUrl("/messages");
            }
          });
        }
        t2.unsubscribe();
        lep.unsubscribe();
      });
    });
  }
}
