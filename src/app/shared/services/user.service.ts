import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, QuerySnapshot, getDoc, DocumentSnapshot, DocumentData, arrayUnion, arrayRemove, onSnapshot } from '@angular/fire/firestore';
import { Auth, updateEmail, updatePassword, deleteUser,  updateProfile} from '@angular/fire/auth';
import { Router } from '@angular/router';

import { ChatService } from "./chat.service";
import { MessageService } from "./message.service";
import { Chat } from "../models/Chat";

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
    return setDoc(userDoc,{email: email, uid: uid, username: username, friends: [], pchats: [],groups: []});
  }

  get(): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const usersCollection = collection(this.firestore, this.collectionName);    
    return getDocs(usersCollection);
  }

  async updateData(newEmail: string, newPassword: string, newDisplayName: string, upEmail: boolean, upPassword: boolean, upDisplayName: boolean) {
    const userDoc = doc(this.firestore, this.collectionName, this.auth.currentUser!.uid);
    let error = false;
    if(upEmail) {
      await updateEmail(this.auth.currentUser!, newEmail).catch(error => {
        error = true;
      });
      await updateDoc(userDoc, { email: newEmail }).catch(error => {
        error = true;
      });
    }
    if(upPassword) {
      await updatePassword(this.auth.currentUser!, newPassword).catch(error => {
        error = true;
      });
    }
    if(upDisplayName) {
      await this.messageService.getMessagesByOwner(this.auth.currentUser!.displayName!).then(snapshot => {
        snapshot.docs.forEach(async (data) => {
          const messageDocRef = doc(this.firestore, this.messageService.collectionName, data.id);
          await updateDoc(messageDocRef, { owner: newDisplayName });
        });
      });

      await updateProfile(this.auth.currentUser!, { displayName: newDisplayName }).catch(error => {
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

  async getPrivateChats() {
    const docSnap = await getDoc(doc(this.firestore, this.collectionName, this.auth.currentUser!.uid));
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
    let chats = await this.getPrivateChats();
    for (const chat of chats) {
        await this.chatService.delete(chat.id);
    }

    // Delete user from Firebase Authentication
    await deleteUser(this.auth.currentUser!);

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
}
