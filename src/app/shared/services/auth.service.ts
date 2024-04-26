import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth) {
  }

  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  signup(email: string, passwrod: string) {
    return this.auth.createUserWithEmailAndPassword(email, passwrod);
  }

  logout() {
    localStorage.setItem("currentChat","null")
    localStorage.setItem('friends', "null")
    return this.auth.signOut()
  }

  isUserLoggedIn() {
    return this.auth.user
  }
}
