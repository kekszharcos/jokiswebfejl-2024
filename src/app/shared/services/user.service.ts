import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {User} from "../models/User";
import {ChatService} from "./chat.service";
import {MessageService} from "./message.service";
import {FriendService} from "./friend.service";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  collectionName = 'Users';

  constructor(private router: Router, private authService: AuthService, private afs: AngularFirestore, private chatService: ChatService, private messageService: MessageService, private friendService: FriendService, private auth: AngularFireAuth) {
  }

  create(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user)
  }

  get() {
    return this.afs.collection<User>(this.collectionName).valueChanges()
  }

  update(user: User, pw: string) {
    this.authService.isUserLoggedIn().subscribe(isUserLoggedIn => {
      isUserLoggedIn?.verifyBeforeUpdateEmail(user.email).then(r => {
        isUserLoggedIn?.updateEmail(user.email)
        if (pw.trim() !== '') {
          isUserLoggedIn?.updatePassword(pw)
        }
      }).then(r => {
        this.authService.logout().then(r => this.router.navigate(['/login']).then(r => {
          return this.afs.collection<User>(this.collectionName).doc(user.id).update(user)
        }))
      })
    })
  }

  delete(id: string) {
    this.friendService.getOwnFriends(id).subscribe(value => {
      for (let i = 0; i < value.length; i++) {
        //this.friendService.delete(value[i].user)
      }
    })
    let temp = this.chatService.getOwnChats(id)
    for (let i = 0; i < temp.length; i++) {
      let chot = JSON.parse(temp[i].users)
      if (chot.length <= 2) {
        //this.chatService.delete(temp[i].id)
      } else {
        chot = chot.filter((filter: string) => filter !== id)
        temp[i].users = JSON.stringify(chot)
        console.log(temp[i].users)
        //this.chatService.update(temp[i])
      }
      this.messageService.getMessageByChatId(temp[i].id).subscribe(value => {
        for (let j = 0; j < value.length; j++) {
          //this.messageService.delete(value[i].owner)
        }
      })
    }
    this.authService.isUserLoggedIn().subscribe(isUserLoggedIn => {
      //isUserLoggedIn?.delete()
    })
    //return this.afs.collection<User>(this.collectionName).doc(id).delete()
  }

  getUserById(userId: string) {
    return this.afs.collection<User>(this.collectionName, ref => ref.where('id', "==", userId)).valueChanges()
  }
}
