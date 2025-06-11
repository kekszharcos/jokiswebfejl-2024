import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, browserLocalPersistence, setPersistence, authState, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { getAuth, updateProfile } from "firebase/auth";
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(public auth: Auth, private userService: UserService) {
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
    await signInWithPopup(this.auth, new GoogleAuthProvider()).then((result) => {
      return this.userService.create(result.user.email!, result.user.uid, result.user.displayName!) 
    });
  }
}
