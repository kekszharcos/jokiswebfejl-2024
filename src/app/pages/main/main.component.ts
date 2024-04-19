import { Component } from '@angular/core';
import {ChatService} from "../../shared/services/chat.service";
import {FriendService} from "../../shared/services/friend.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  loggedInUser = JSON.parse(localStorage.getItem('user') as string)

  constructor(private chatService: ChatService,private friendService: FriendService) {
  }

}
