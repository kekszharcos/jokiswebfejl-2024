import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Friend} from "../models/Friend";

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  collectionName = 'Friends';

  constructor(private afs: AngularFirestore) {
  }

  create(friend: Friend) {
    return this.afs.collection<Friend>(this.collectionName).doc(friend.user).set(friend)
  }

  get() {
    return this.afs.collection<Friend>(this.collectionName).valueChanges()
  }

  delete(id: string) {
    return this.afs.collection<Friend>(this.collectionName).doc(id).delete()
  }
}
