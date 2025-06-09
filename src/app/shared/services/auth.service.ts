import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, browserLocalPersistence, setPersistence } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {
    setPersistence(this.auth, browserLocalPersistence); // or browserSessionPersistence
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signup(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(signOut(this.auth));
  }

  isUserLoggedIn(): Observable<User | null> {
    return new Observable(subscriber => {
      this.auth.onAuthStateChanged(subscriber);
    });
  }
}
