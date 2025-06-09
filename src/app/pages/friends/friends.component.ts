import { Component, OnInit } from '@angular/core';
import { FriendService } from "../../shared/services/friend.service";
import { UserService } from "../../shared/services/user.service";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { User } from "../../shared/models/User";


@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent implements OnInit {
  friends: Array<string> = [];
  loggedInUser?: User | null;
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
  ) {}

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      if (!user) {
        this.loggedInUser = null;
        return;
      }
      this.loggedInUser = {
        id: user.uid,
        username: user.displayName || user.email || '', // fallback, or fetch via service if needed
        email: user.email || ''
        // ...other User fields if needed
      } as User;

      this.friendService.getOwnFriends(user.uid).subscribe(friends => {
        if (friends[0] && Array.isArray(friends[0].friends)) {
          this.friends = friends[0].friends;
        } else {
          this.friends = [];
        }
      });
    });
  }

  openChat(friendId: string) {
    if (!this.loggedInUser) return;
    let breaker = true;
    let lep = this.userService.getUserById(friendId).subscribe(value => {
      let t2 = this.userService.getUserById(this.loggedInUser!.id).subscribe(value2 => {
        this.chat.users = [
          { id: this.loggedInUser!.id, name: value2[0].username, role: "owner" },
          { id: friendId, name: value[0].username, role: "user" }
        ];
        this.ownChats.forEach(chat => {
          if (
            chat.users.some(u => u.id === this.loggedInUser!.id) &&
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
