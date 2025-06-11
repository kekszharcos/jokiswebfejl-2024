import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, collectionData, addDoc, DocumentSnapshot, DocumentData, getDocs, QuerySnapshot } from '@angular/fire/firestore';
import { Message } from "../models/Message";
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  collectionName = 'Messages';

  constructor(private firestore: Firestore) {}

  create(message: any) {
    const messagesCollection = collection(this.firestore, this.collectionName);
    return addDoc(messagesCollection, message)
  }

  get() {
    const messagesCollection = collection(this.firestore, this.collectionName);
    return getDocs(messagesCollection) ;
  }

  //changed
  getMessagesByChatId(chatId: string): Promise<QuerySnapshot<DocumentData, DocumentData>>{
    const messagesCollection = collection(this.firestore, this.collectionName);
    const q = query(messagesCollection, where('chatId', '==', chatId), orderBy('time'));
    return getDocs(q);
  }


  getMessagesByOwner(ownerId: string): Promise<QuerySnapshot<DocumentData, DocumentData>>{
    const messagesCollection = collection(this.firestore, this.collectionName);
    const q = query(messagesCollection, where('owner', '==', ownerId));
    return getDocs(q);;
  }

  update(message: Message) {
    const messageDoc = doc(this.firestore, this.collectionName, message.id);
    return updateDoc(messageDoc, { ...message });
  }

  delete(id: string) {
    const messageDoc = doc(this.firestore, this.collectionName, id);
    return deleteDoc(messageDoc);
  }
   
}
