import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {User} from "../models/User";
import {Message} from "../models/Message";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  collectionName = 'Messages';

  constructor(private afs: AngularFirestore) {
  }

  create(message: Message) {
    return this.afs.collection<Message>(this.collectionName).doc(message.id).set(message)
  }

  get() {
    return this.afs.collection<Message>(this.collectionName).valueChanges()
  }

  update(message: Message) {
    return this.afs.collection<Message>(this.collectionName).doc(message.id).update(message)
  }

  delete(message: Message) {
    return this.afs.collection<Message>(this.collectionName).doc(message.id).delete()
  }
}
