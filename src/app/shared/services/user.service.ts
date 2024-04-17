import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {User} from "../models/User";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  collectionName = 'Users';

  constructor(private afs: AngularFirestore) {
  }

  create(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user)
  }

  get() {
    return this.afs.collection<User>(this.collectionName).valueChanges()
  }

  update(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).update(user)
  }

  delete(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).delete()
  }
}
