import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Chat} from "../models/Chat";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  collectionName = 'Chats';
  chats:Array<Chat> = [];

  constructor(private afs: AngularFirestore) {
  }

  create(chat: Chat) {
    return this.afs.collection<Chat>(this.collectionName).doc(chat.id).set(chat)
  }

  getOwnChats(uid: string) {
    this.afs.collection<Chat>(this.collectionName).valueChanges().subscribe(value => {
      this.chats = value.filter(chat => JSON.parse(chat.users).includes(uid));

    });
    return this.chats;
  }
  getOwnChatsObs() {
    return this.afs.collection<Chat>(this.collectionName).valueChanges()
  }

  getChatsById(id:string) {
    return this.afs.collection<Chat>(this.collectionName, ref => ref.where('id',"==",id )).valueChanges()

  }

  update(chat: Chat) {
    return this.afs.collection<Chat>(this.collectionName).doc(chat.id).update(chat)
  }

  delete(id: string) {
    return this.afs.collection<Chat>(this.collectionName).doc(id).delete()
  }


}
