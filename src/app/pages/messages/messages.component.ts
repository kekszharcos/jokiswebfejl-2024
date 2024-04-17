import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MessageService} from "../../shared/services/message.service";
import {Message} from "../../shared/models/Message";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  loggedInUser: any;
  messageToSend: FormControl = new FormControl<any>('');
  test = ['asd']
  message: Message = {
    id: this.afs.createId(),
    toWho: '',
    owner: '',
    text: '',
    time: ''
  }

  constructor(private messageService: MessageService, private afs: AngularFirestore) {

  }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('user') as string)
    this.message.owner = this.loggedInUser.uid;
  }

  onSend() {
    this.message.text = this.messageToSend.value
    this.message.time = new Date().toISOString();
    console.log(JSON.stringify(this.test))
  }
}
