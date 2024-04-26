import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "../../shared/services/auth.service";
import {User} from "../../shared/models/User";
import {UserService} from "../../shared/services/user.service";
import {Router} from "@angular/router";

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

  constructor(private location:Location, private authService: AuthService, private userService: UserService, private router:Router) {
  }
  onSubmit() {
    this.authService.signup((this.signUpFrom.get('email')?.value as string),(this.signUpFrom.get('password')?.value as string)).then(cred=>{
      const user:User = {
        id: cred.user?.uid as string,
        email: this.signUpFrom.get('email')?.value as string,
        username: this.signUpFrom.get('email')?.value?.split('@')[0] as string
      }
      this.userService.create(user).then(_=>{
        this.router.navigateByUrl('main')
      }).catch(err => {

      })
    })
  }
  goBack(){
    this.location.back()
  }
}
