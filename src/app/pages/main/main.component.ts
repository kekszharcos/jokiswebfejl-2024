import { Component, OnInit } from '@angular/core';
import { ChatService } from "../../shared/services/chat.service";
import { FriendService } from "../../shared/services/friend.service";
import { AuthService } from "../../shared/services/auth.service";
import { User } from "../../shared/models/User";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    standalone: false
})
export class MainComponent implements OnInit {
  loggedInUser?: User | null;
  friends: Array<string> = [];

  constructor(
    private chatService: ChatService,
    private friendService: FriendService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      if (!user) {
        this.loggedInUser = null;
        return;
      }

      // Map Firebase user to your app's User model
      this.loggedInUser = {
        id: user.uid,
        username: user.displayName || user.email || '', // fallback if displayName is missing
        email: user.email || ''
        // ...add other fields if needed
      } as User;

      this.friendService.getOwnFriends(user.uid).subscribe(friendsDocs => {
        // friendsDocs[0].friends should be an array if you use Firestore arrays
        if (friendsDocs[0] && Array.isArray(friendsDocs[0].friends)) {
          this.friends = friendsDocs[0].friends;
        } else {
          this.friends = [];
        }
      });
    });
  }
}
