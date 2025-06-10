import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs, collectionData, QuerySnapshot, getDoc, DocumentSnapshot, DocumentData, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Auth, updateEmail, updatePassword, deleteUser, signOut, onAuthStateChanged, User, updateProfile, updateCurrentUser, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { ChatService } from "./chat.service";
import { MessageService } from "./message.service";
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Friend } from "../models/Friend";

@Injectable({ providedIn: 'root' })
export class UserService {
  collectionName = 'Users';

  constructor(
    private router: Router,
    private firestore: Firestore,
    private chatService: ChatService,
    private messageService: MessageService,
    private auth: Auth
  ) {}

  create(email: string, uid: string, username: string) {
    const userDoc = doc(this.firestore, this.collectionName, uid);
    return setDoc(userDoc,{email: email, uid: uid, username: username, friends: []});
  }

  get(): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const usersCollection = collection(this.firestore, this.collectionName);    
    return getDocs(usersCollection);
  }

  update(newEmail: string, newPassword: string, newDisplayName: string, upEmail: boolean, upPassword: boolean, upDisplayName: boolean): any {
    const userDoc = doc(this.firestore, this.collectionName, this.auth.currentUser!.uid);
    if(upEmail) {
      updateEmail(this.auth.currentUser!, newEmail);
      updateDoc(userDoc, { email: newEmail });
    }
    if(upPassword) {
      updatePassword(this.auth.currentUser!, newPassword);
    }
    if(upDisplayName) {
      updateProfile(this.auth.currentUser!, { displayName: newDisplayName });
      updateDoc(userDoc, { username: newDisplayName });
    }
  }

  getFriends(uid: string): Promise<DocumentSnapshot<DocumentData, DocumentData>> {
    return getDoc(doc(this.firestore, this.collectionName, uid));
  }

  addFriend(userUID: string, friendUID: string) {
    return updateDoc(doc(this.firestore, this.collectionName, userUID), { friends: arrayUnion(friendUID)})
  }

  deleteFriend(userUID: string, friendUID: string) {
    return updateDoc(doc(this.firestore, this.collectionName, userUID), { friends: arrayRemove(friendUID)})
  }
/*
  delete(id: string): Observable<any> {
    // Delete all friend records for this user
    const friends$ = this.userService.getFriends(id).pipe(
      map(friends => friends.map(f => this.userService.deleteFriend(f.user)))
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
*/
  getUserById(userId: string) {
    return getDoc(doc(this.firestore, this.collectionName, userId));
  }
}
