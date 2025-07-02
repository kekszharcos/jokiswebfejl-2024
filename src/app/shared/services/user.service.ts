import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, QuerySnapshot, getDoc, DocumentSnapshot, DocumentData, arrayUnion, arrayRemove, onSnapshot } from '@angular/fire/firestore';
import { Auth, updateEmail, updatePassword, deleteUser,  updateProfile, User, authState} from '@angular/fire/auth';
import { Router } from '@angular/router';

import { ChatService } from "./chat.service";
import { MessageService } from "./message.service";
import { Chat } from "../models/Chat";

@Injectable({ providedIn: 'root' })
export class UserService {
  collectionName = 'Users';
  currentUser: User;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth,
    private chatService: ChatService,
    private messageService: MessageService
  ) {
    this.currentUser = this.auth.currentUser!;
    authState(this.auth).subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null as any; // Handle case when user is not logged in
      }
    });
  }

  create(email: string, uid: string, username: string) {
    const userDoc = doc(this.firestore, this.collectionName, uid);
    return setDoc(userDoc,{email: email, uid: uid, username: username, friends: [], pchats: [],groups: []});
  }

  get(): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const usersCollection = collection(this.firestore, this.collectionName);    
    return getDocs(usersCollection);
  }

  async updateData(newEmail: string, newPassword: string, newDisplayName: string, upEmail: boolean, upPassword: boolean, upDisplayName: boolean) {
    if (!this.currentUser) {
      return Promise.reject('No user is currently logged in');
    }
    const userDoc = doc(this.firestore, this.collectionName, this.currentUser!.uid);
    let error = false;
    if(upEmail) {
      await updateEmail(this.currentUser!, newEmail).catch(error => {
        error = true;
      });
      await updateDoc(userDoc, { email: newEmail }).catch(error => {
        error = true;
      });
    }
    if(upPassword) {
      await updatePassword(this.currentUser!, newPassword).catch(error => {
        error = true;
      });
    }
    if(upDisplayName) {
      await this.messageService.getMessagesByOwner(this.currentUser!.uid).then(snapshot => {
        snapshot.docs.forEach(async (data) => {
          const messageDocRef = doc(this.firestore, this.messageService.collectionName, data.id);
          await updateDoc(messageDocRef, { owner: newDisplayName });
        });
      });

      await updateProfile(this.currentUser!, { displayName: newDisplayName }).catch(error => {
        error = true;
      });
      await updateDoc(userDoc, { username: newDisplayName }).catch(error => {
        error = true;
      });
      
    }
    return error ? Promise.reject('Error updating user data') : Promise.resolve('User data updated successfully');
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

  async getPrivateChats(userUID: string) {
    const docSnap = await getDoc(doc(this.firestore, this.collectionName, userUID));
    let chats: Chat[] = [];

    for (const chatId of docSnap.data()?.['pchats'] || []) {
      if (!chatId) continue; // Skip if chatId is undefined or null
      const chatDoc = await this.chatService.getChatById(chatId);
      //console.log("Chat document:", chatDoc.data());
      if (chatDoc.exists()) {
        chats.push({ id: chatDoc.id, ...chatDoc.data() } as Chat);
      }
    }
    return chats;
  }

  async delete(id: string) {
    // Delete all friend records for this user
    const docFriends = await this.getFriends(id);
    const friendUIDArray = docFriends.data()?.['friends'] || [];
    for (const friendUID of friendUIDArray) {
      const docFriendUsers = await this.getUserById(friendUID);
      const FriendUser = docFriendUsers.data();
      if (FriendUser) {
        await this.deleteFriend(friendUID, id);
        await this.deleteFriend(id, friendUID);
        //console.log(`Friendship between ${id} and ${friendUID} deleted.`);
      }
    }

    // Delete all messages sent by this user
    const messagesSnapshot = await this.messageService.getMessagesByOwner(id);
    for (const messageDoc of messagesSnapshot.docs) {
      const messageDocRef = doc(this.firestore, this.messageService.collectionName, messageDoc.id);
      await deleteDoc(messageDocRef);
    }

    // Delete or update all chats involving this user
    let chats = await this.getPrivateChats(this.currentUser!.uid);
    for (const chat of chats) {
        await this.chatService.delete(chat.id);
    }

    // Delete user from Firebase Authentication
    await deleteUser(this.currentUser!);

    // Delete user document from Firestore
    return deleteDoc(doc(this.firestore, this.collectionName, id));
  }

  getUserById(userId: string) {
    return getDoc(doc(this.firestore, this.collectionName, userId));
  }

  // Returns an unsubscribe function
  listenToPrivateChats(uid: string, callback: (chats: Chat[]) => void) {
    const userDoc = doc(this.firestore, this.collectionName, uid);
    return onSnapshot(userDoc, async (docSnap) => {
      const pchats = docSnap.data()?.['pchats'] || [];
      const chats: Chat[] = [];
      for (const chatId of pchats) {
        if (!chatId) continue;
        const chatDoc = await this.chatService.getChatById(chatId);
        if (chatDoc.exists()) {
          chats.push({ id: chatDoc.id, ...chatDoc.data() } as Chat);
        }
      }
      callback(chats);
    });
  }

  // Check if current user logged in with Google
  isGoogleUser(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.providerData.some(provider => provider.providerId === 'google.com');
  }

  // Check if current user logged in with email/password
  isEmailPasswordUser(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.providerData.some(provider => provider.providerId === 'password');
  }

  // Get all provider IDs for current user
  getUserProviders(): string[] {
    if (!this.currentUser) return [];
    return this.currentUser.providerData.map(provider => provider.providerId);
  }

  // Check if user has a specific provider
  hasProvider(providerId: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.providerData.some(provider => provider.providerId === providerId);
  }
}
