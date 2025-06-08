import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, collectionData, addDoc } from '@angular/fire/firestore';
import { Chat } from "../models/Chat";
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  collectionName = 'Chats';

  constructor(private firestore: Firestore) {}

  create(chat: Chat) {
    const chatsCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(chatsCollection, chat));
  }

  getOwnChats(uid: string): Observable<Chat[]> {
    const chatsCollection = collection(this.firestore, this.collectionName);
    const q = query(chatsCollection, where("users", "array-contains", uid));
    return collectionData(q, { idField: 'id' }) as Observable<Chat[]>;
  }

  update(chat: Chat) {
    const chatDoc = doc(this.firestore, this.collectionName, chat.id);
    return from(updateDoc(chatDoc, { ...chat }));
  }

  delete(id: string) {
    const chatDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(chatDoc));
  }

  getChatsById(chatId: string): Observable<Chat[]> {
    const chatsCollection = collection(this.firestore, this.collectionName);
    const q = query(chatsCollection, where('id', '==', chatId));
    return collectionData(q, { idField: 'id' }) as Observable<Chat[]>;
  }
}
