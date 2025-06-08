import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, collectionData, addDoc } from '@angular/fire/firestore';
import { Message } from "../models/Message";
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  collectionName = 'Messages';

  constructor(private firestore: Firestore) {}

  create(message: Message) {
    const messagesCollection = collection(this.firestore, this.collectionName);
    return from(addDoc(messagesCollection, message));
  }

  get(): Observable<Message[]> {
    const messagesCollection = collection(this.firestore, this.collectionName);
    return collectionData(messagesCollection, { idField: 'id' }) as Observable<Message[]>;
  }

  getMessageByChatId(chatId: string): Observable<Message[]> {
    const messagesCollection = collection(this.firestore, this.collectionName);
    const q = query(messagesCollection, where('chatId', '==', chatId), orderBy('time'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  update(message: Message) {
    const messageDoc = doc(this.firestore, this.collectionName, message.id);
    return from(updateDoc(messageDoc, { ...message }));
  }

  delete(id: string) {
    const messageDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(messageDoc));
  }
}
