import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, deleteDoc, query, where, collectionData } from '@angular/fire/firestore';
import { Friend } from "../models/Friend";
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FriendService {
  collectionName = 'Friends';

  constructor(private firestore: Firestore) {}

  create(friend: Friend) {
    const friendDoc = doc(this.firestore, this.collectionName, friend.user);
    return from(setDoc(friendDoc, friend));
  }

  update(friend: Friend) {
    const friendDoc = doc(this.firestore, this.collectionName, friend.user);
    return from(updateDoc(friendDoc, { ...friend }));
  }

  getOwnFriends(uid: string): Observable<Friend[]> {
    const friendsCollection = collection(this.firestore, this.collectionName);
    const q = query(friendsCollection, where("user", "==", uid));
    return collectionData(q, { idField: 'user' }) as Observable<Friend[]>;
  }

  delete(id: string) {
    const friendDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(friendDoc));
  }

  getFriends() {
    const friendsCollection = collection(this.firestore, 'Friends');
    return collectionData(friendsCollection);
  }
}
