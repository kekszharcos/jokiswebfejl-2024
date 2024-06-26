import { Component } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../shared/services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: FormControl = new FormControl('', Validators.required);
  password: FormControl = new FormControl('', [Validators.required,Validators.minLength(6)]);
  isActive = true;
  constructor(private router:Router, private authService:AuthService) {

  }

  loggingIn() {
    if (this.email.valid && this.password.valid){
      this.authService.login(this.email.value.trim(),this.password.value)
        .then(r => {this.router.navigateByUrl("/main");})
    }
  }

  cluck(){
    this.isActive = !this.isActive
  }
}
