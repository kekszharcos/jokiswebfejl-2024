import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";

import { User } from "../models/User";
import { ChatService } from "./chat.service";
import { FriendService } from "./friend.service";
import { MessageService } from "./message.service";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private chatService: ChatService,
    private friendService: FriendService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  collectionName = 'Users';

  create(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user);
  }

  get() {
    return this.afs.collection<User>(this.collectionName).valueChanges();
  }

  update(user: User, pw: string, isit: boolean) {
    const subscr = this.authService.isUserLoggedIn().subscribe(isUserLoggedIn => {
      isUserLoggedIn?.verifyBeforeUpdateEmail(user.email).then(() => {
        if (isit) isUserLoggedIn?.updateEmail(user.email);
        if (pw.trim() !== '') isUserLoggedIn?.updatePassword(pw);
      }).then(() => {
        this.authService.logout().then(() => {
          this.router.navigateByUrl('').then(() => {
            subscr.unsubscribe();
            return this.afs.collection<User>(this.collectionName).doc(user.id).update(user);
          });
        });
      });
    });
  }

  delete(id: string) {
    this.friendService.getOwnFriends(id).subscribe(value => {
      for (const f of value) {
        this.friendService.delete(f.user);
      }
    });

    const chats = this.chatService.getOwnChats(id);
    for (const chat of chats) {
      let users = JSON.parse(chat.users);
      if (users.length <= 2) {
        this.chatService.delete(chat.id);
      } else {
        users = users.filter((u: string) => u !== id);
        chat.users = JSON.stringify(users);
        this.chatService.update(chat);
      }

      this.messageService.getMessageByChatId(chat.id).subscribe(messages => {
        for (const msg of messages) {
          this.messageService.delete(msg.owner);
        }
      });
    }

    this.authService.isUserLoggedIn().subscribe(user => {
      user?.delete();
    });

    return this.afs.collection<User>(this.collectionName).doc(id).delete();
  }

  getUserById(userId: string) {
    return this.afs.collection<User>(this.collectionName, ref =>
      ref.where('id', '==', userId)
    ).valueChanges();
  }
}
