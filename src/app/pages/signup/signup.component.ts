import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Location} from "@angular/common";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  signUpFrom = new FormGroup({
    email:new FormControl(''),
    password:new FormControl(''),
    password_re:new FormControl(''),
  })

  constructor(private location:Location) {
  }
  onSubmit() {

  }
  goBack(){
    this.location.back()
  }
}
