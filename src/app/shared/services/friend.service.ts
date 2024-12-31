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
    return this.afs.collection<Friend>(this.collectionName).doc(friend.user).set(friend)//.then(r=> location.reload())
  }

  update(friend: Friend) {
    return this.afs.collection<Friend>(this.collectionName).doc(friend.user).update(friend)
  }

  getOwnFriends(uid:string) {
    return this.afs.collection<Friend>(this.collectionName, ref => ref.where("user","==",uid )).valueChanges()
  }

  delete(id: string) {
    return this.afs.collection<Friend>(this.collectionName).doc(id).delete()
  }
}
