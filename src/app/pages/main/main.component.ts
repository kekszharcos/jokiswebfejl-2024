import {Component, OnInit} from '@angular/core';
import {ChatService} from "../../shared/services/chat.service";
import {FriendService} from "../../shared/services/friend.service";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss',
    standalone: false
})
export class MainComponent implements OnInit{
  loggedInUser = JSON.parse(localStorage.getItem('user') as string)
  friends: Array<string> = [];

  constructor(private chatService: ChatService,private friendService: FriendService) {
  }

  ngOnInit(): void {
    this.friendService.getOwnFriends(this.loggedInUser.uid as string).subscribe(friends => {
      if (typeof friends[0] !== "undefined"){
        localStorage.setItem('friends', JSON.stringify(friends[0].friends))
      }else {
        localStorage.setItem('friends', "null")
      }

    })
  }



}
