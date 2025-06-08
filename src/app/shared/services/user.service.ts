import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { Auth, updateEmail, updatePassword, deleteUser, signOut, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { User } from "../models/User";
import { ChatService } from "./chat.service";
import { FriendService } from "./friend.service";
import { MessageService } from "./message.service";
import { AuthService } from "./auth.service";
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  collectionName = 'Users';

  constructor(
    private router: Router,
    private firestore: Firestore,
    private chatService: ChatService,
    private friendService: FriendService,
    private messageService: MessageService,
    private auth: Auth
  ) {}

  create(user: User) {
    const userDoc = doc(this.firestore, this.collectionName, user.id);
    return from(setDoc(userDoc, user));
  }

  get(): Observable<User[]> {
    const usersCollection = collection(this.firestore, this.collectionName);
    return collectionData(usersCollection, { idField: 'id' }) as Observable<User[]>;
  }

  update(user: User, pw: string, isit: boolean) {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (isit) await updateEmail(firebaseUser, user.email);
        if (pw.trim() !== '') await updatePassword(firebaseUser, pw);
        await signOut(this.auth);
        await this.router.navigateByUrl('');
        const userDoc = doc(this.firestore, this.collectionName, user.id);
        await updateDoc(userDoc, { ...user });
      }
    });
  }

  delete(id: string) {
    this.friendService.getOwnFriends(id).subscribe(value => {
      for (const f of value) {
        this.friendService.delete(f.user);
      }
    });

    const chats$ = this.chatService.getOwnChats(id);
    chats$.subscribe(chats => {
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
    });

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        await deleteUser(firebaseUser);
      }
    });

    const userDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(userDoc));
  }

  getUserById(userId: string): Observable<User[]> {
    const usersCollection = collection(this.firestore, this.collectionName);
    const q = query(usersCollection, where('id', '==', userId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.data() as User))
    );
  }
}
