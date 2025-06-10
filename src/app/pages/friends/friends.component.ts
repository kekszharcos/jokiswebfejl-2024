import { Component } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';
import { Friend } from "../../shared/models/Friend"

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent {
  loggedInUser: User | null = null;
  friends: Array<Friend> = [];
  chat: Chat = { id: '', users: [], messages: [] };
  ownChats: Array<Chat> = [];

  constructor(private userService: UserService, private chatService: ChatService, private router: Router, private authService: AuthService) {
    authState(this.authService.auth).subscribe(user => {this.loggedInUser = user
      if (this.loggedInUser){
        this.userService.getFriends(this.loggedInUser.uid).then(doc => {
          let friendUIDArray = doc.data()!['friends'];
          for (let friendUID of friendUIDArray) {
            this.userService.getUserById(friendUID).then((doc) => {
              let valami = doc.data();
              if(valami) {
                this.friends.push({ uid: valami['uid'], username: valami['username']});
              }
            })
          }
        });
      }
    });
  }

  openChat(friendId: string) {
    if (!this.loggedInUser) return;
    // Check if a chat already exists with the selected friend if yes, navigate to that chat if not, create a new chat thats it
    
    let breaker = true;
    this.userService.getUserById(friendId).then(friendDoc => {
      this.chat.users = [
        { id: this.loggedInUser!.uid, name: this.loggedInUser!.displayName, role: "owner" },
        { id: friendId, name: friendDoc.data()!['username'], role: "user" }
      ];
      this.ownChats.forEach(chat => {
        if (chat.users.some(u => u.id === this.loggedInUser!.uid) && chat.users.some(u => u.id === friendId)) {
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
    });
  }
  trackByFriend(index: number, friend: any) {
    return friend.uid;
  }
}
