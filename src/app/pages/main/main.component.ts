import { Component } from '@angular/core';
import { ChatService } from "../../shared/services/chat.service";
import { FriendService } from "../../shared/services/friend.service";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    standalone: false
})
export class MainComponent {
  loggedInUser: User | null = null;
  friends: Array<string> = [];

  constructor(
    private chatService: ChatService,
    private friendService: FriendService,
    private authService: AuthService
  ) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
  }
}
