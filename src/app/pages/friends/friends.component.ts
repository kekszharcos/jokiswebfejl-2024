import { Component } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { ChatService } from "../../shared/services/chat.service";
import { Chat } from "../../shared/models/Chat";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { User, authState } from '@angular/fire/auth';
import { Friend } from "../../shared/models/Friend"
import { FormControl } from '@angular/forms';
import { MessageService } from '../../shared/services/message.service';
import { Message } from '../../shared/models/Message';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
  standalone: false
})
export class FriendsComponent {
  loggedInUser: User | null = null;
  friends: Array<Friend> = [];
  ownChats: Array<Chat> = [];
  selectedFriend: Friend | null = null;
  chatMessages: Message[] = [];
  messageToSend = new FormControl('');
  loggedInOwnerInGroup = false;
  loggedInModInGroup = false;

  constructor(private userService: UserService, private chatService: ChatService, private router: Router, private authService: AuthService, private messageService: MessageService) {
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
    this.userService.getPrivateChats().then((doc) => {
      let data = doc.data();
      let friendsCopy = [...this.friends];
      
      if(data) {
        let chats = data['pchats'];
        for(let chatId of chats) {
          this.chatService.getChatById(chatId).then((chatDoc) => {
            let chatData = chatDoc.data();
            if(chatData) {
              let uid1 = chatData['uid1'];
              let uid2 = chatData['uid2'];
              let messages = chatData['messages']
              this.ownChats.push({id: chatId, messages: messages, uid1: uid1, uid2: uid2});
              friendsCopy = friendsCopy.filter(friend => friend.uid !== uid1 && friend !== uid2);
            }
          })
        }
      }
    })
    /*
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
    });*/
  }
  selectFriend(friend: Friend) {
    this.selectedFriend = friend;
    // Load chat messages for this friend
    this.loadMessages(friend.uid);
  }

  loadMessages(friendUid: string) {
    // Implement logic to load messages between loggedInUser and friendUid
    // Example:
    // this.messageService.getMessagesBetween(this.loggedInUser.uid, friendUid).subscribe(messages => {
    //   this.chatMessages = messages;
    // });
  }

  onSend(friendUid: string) {
    if (!this.loggedInUser) return;
    const text = this.messageToSend.value;
    if (!text || text.trim() === "") return;

    const message: Message = {
      id: '',
      chatId: '', // set chatId if you have it
      owner: this.loggedInUser.displayName || this.loggedInUser.uid,
      text: text,
      time: new Date().toISOString()
    };
    this.messageToSend.reset();
    this.messageService.create(message).subscribe();
    // Optionally reload messages
    this.loadMessages(friendUid);
  }

  deleteMessageFromChat(messageId: string) {
    this.messageService.delete(messageId).subscribe(() => {
      if (this.selectedFriend) this.loadMessages(this.selectedFriend.uid);
    });
  }

  trackByFriend(index: number, friend: any) {
    return friend.uid;
  }

  trackByMessage(index: number, message: Message) {
    return message.id;
  }
}
