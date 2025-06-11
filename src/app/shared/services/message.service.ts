import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, addDoc, DocumentData, getDocs, QuerySnapshot, onSnapshot } from '@angular/fire/firestore';
import { Message } from "../models/Message";

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
    return getDocs(q);
  }

  update(message: Message) {
    const messageDoc = doc(this.firestore, this.collectionName, message.id);
    return updateDoc(messageDoc, { ...message });
  }

  delete(id: string) {
    const messageDoc = doc(this.firestore, this.collectionName, id);
    return deleteDoc(messageDoc);
  }
   
  listenToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const messagesCollection = collection(this.firestore, this.collectionName);
    const q = query(messagesCollection, where('chatId', '==', chatId), orderBy('time'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      callback(messages);
    });
  }
}
