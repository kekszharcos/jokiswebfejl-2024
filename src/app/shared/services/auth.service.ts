import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signup(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    localStorage.setItem("currentChat", "null");
    localStorage.setItem('friends', "null");
    return from(signOut(this.auth));
  }

  isUserLoggedIn(): Observable<User | null> {
    return new Observable(subscriber => {
      this.auth.onAuthStateChanged(subscriber);
    });
  }
}
