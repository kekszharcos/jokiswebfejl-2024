import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Message} from "../models/Message";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  collectionName = 'Messages';

  constructor(private afs: AngularFirestore) {
  }

  create(message: Message) {
    message.id = this.afs.createId()
    return this.afs.collection<Message>(this.collectionName).doc(message.id).set(message)
  }

  get() {
    return this.afs.collection<Message>(this.collectionName).valueChanges()
  }
  getMessageByChatId(chatId:string) {
    return this.afs.collection<Message>(this.collectionName,ref => ref.where('chatId',"==",chatId).orderBy('time')).valueChanges()
  }

  update(message: Message) {
    return this.afs.collection<Message>(this.collectionName).doc(message.id).update(message)
  }

  delete(id:string) {
    return this.afs.collection<Message>(this.collectionName).doc(id).delete()
  }
}
