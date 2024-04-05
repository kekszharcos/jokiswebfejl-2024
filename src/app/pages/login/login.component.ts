import { Component } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: FormControl = new FormControl('', Validators.required);
  password: FormControl = new FormControl('', Validators.required);

  constructor(private router:Router) {

  }

  loggingIn() {
    if (this.email.value === "xd@xd.xd" && this.password.value === "xd"){
      this.router.navigateByUrl("/main");
    }
  }
}
