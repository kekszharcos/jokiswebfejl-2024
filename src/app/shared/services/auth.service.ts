import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, browserLocalPersistence, setPersistence, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { updateProfile } from "firebase/auth";
import { UserService } from './user.service';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(public auth: Auth, private userService: UserService, private messageService: MessageService) {
    setPersistence(this.auth, browserLocalPersistence); // or browserSessionPersistence
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signupUser(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  updateUser(user: User, username: string) {
    return updateProfile(user, { displayName: username });
  }

  logout() {
    return this.auth.signOut();
  }

  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const doc = await this.userService.getUserById(result.user.uid);
    if (!doc.exists()) {
      await this.userService.create(result.user.email!, result.user.uid, result.user.displayName!);
      //console.log('User created successfully');
    }else{
      this.userService.updateData('', '', result.user.displayName!, false, false, true);
    }
  }
}
