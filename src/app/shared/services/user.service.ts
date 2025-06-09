import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { Auth, updateEmail, updatePassword, deleteUser, signOut, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { User } from "../models/User";
import { ChatService } from "./chat.service";
import { FriendService } from "./friend.service";
import { MessageService } from "./message.service";
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

  update(user: User, pw: string, isit: boolean): Observable<any> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            if (isit) await updateEmail(firebaseUser, user.email);
            if (pw.trim() !== '') await updatePassword(firebaseUser, pw);
            await signOut(this.auth);
            await this.router.navigateByUrl('');
            const userDoc = doc(this.firestore, this.collectionName, user.id);
            await updateDoc(userDoc, { ...user });
            observer.next({ success: true });
            observer.complete();
          } else {
            observer.error('No authenticated user.');
          }
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  delete(id: string): Observable<any> {
    // Delete all friend records for this user
    const friends$ = this.friendService.getOwnFriends(id).pipe(
      map(friends => friends.map(f => this.friendService.delete(f.user)))
    );

    // Delete or update all chats involving this user
    const chats$ = this.chatService.getOwnChats(id).pipe(
      map(chats => chats.map(chat => {
        // chat.users is now an array of user objects
        if (chat.users.length <= 2) {
          // Delete the whole chat if only 2 or fewer users
          return this.chatService.delete(chat.id);
        } else {
          // Remove the user from the chat and update
          chat.users = chat.users.filter((u: any) => u.id !== id);
          return this.chatService.update(chat);
        }
      }))
    );

    // Delete all messages sent by this user
    const messages$ = this.messageService.getMessagesByOwner(id).pipe(
      map(messages => messages.map(msg => this.messageService.delete(msg.id)))
    );

    // Delete the user from Firebase Auth
    const deleteAuthUser$ = new Observable(observer => {
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser) {
          await deleteUser(firebaseUser);
        }
        observer.next({ success: true });
        observer.complete();
      });
    });

    // Delete the user document from Firestore
    const userDoc = doc(this.firestore, this.collectionName, id);
    const deleteUserDoc$ = from(deleteDoc(userDoc));

    // Combine all operations
    return friends$.pipe(
      // Wait for friends to be deleted
      map(() => chats$),
      // Wait for chats to be deleted/updated
      map(() => messages$),
      // Wait for messages to be deleted
      map(() => deleteAuthUser$),
      // Wait for auth user to be deleted
      map(() => deleteUserDoc$)
    );
  }

  getUserById(userId: string): Observable<User[]> {
    const usersCollection = collection(this.firestore, this.collectionName);
    const q = query(usersCollection, where('id', '==', userId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => doc.data() as User))
    );
  }
}
