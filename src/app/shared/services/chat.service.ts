import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, arrayUnion, collectionData, addDoc, getDoc, getDocs } from '@angular/fire/firestore';
import { Chat } from "../models/Chat";
import { from, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  collectionName = 'Chats';

  constructor(private firestore: Firestore) {}

  async create(chat: any) {
    const chatsCollection = collection(this.firestore, this.collectionName);
    const chatDocRef = await addDoc(chatsCollection, chat); // Firestore generates the ID
    await this.updatePChats(chat.uid1, chatDocRef.id)
    await this.updatePChats(chat.uid2, chatDocRef.id)
    return chatDocRef
  }

  /*getPrivateChats(uid: string) {
    const chatsCollection = collection(this.firestore, this.collectionName);
    const q = query(chatsCollection, where("uid1", "==", uid) || where("uid2", "==", uid));
    return getDocs(q);
  }*/

  update(chat: Chat) {
    const chatDoc = doc(this.firestore, this.collectionName, chat.id);
    return updateDoc(chatDoc, { ...chat });
  }

  delete(id: string) {
    const chatDoc = doc(this.firestore, this.collectionName, id);
    return deleteDoc(chatDoc);
  }

  getChatById(chatId: string) {
    return getDoc(doc(this.firestore, this.collectionName, chatId));
  }

  updatePChats(userId: string, chatId: string) {
    return updateDoc(doc(this.firestore, 'Users', userId), { pchats: arrayUnion(chatId) });
  }
}
