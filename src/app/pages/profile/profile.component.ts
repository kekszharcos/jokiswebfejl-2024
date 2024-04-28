import {Component, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/user.service";
import {Router} from "@angular/router";
import {AuthService} from "../../shared/services/auth.service";
import {User} from "../../shared/models/User";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  loggedInUser = JSON.parse(localStorage.getItem('user') as string)
  newUser: User = {
    id: this.loggedInUser.uid,
    username: this.loggedInUser.username,
    email: this.loggedInUser.email,
  }
  pwToSend = ''
  username = new FormControl('',[Validators.minLength(3)])
  email = new FormControl('',[Validators.email])
  password = new FormControl('',[Validators.minLength(6)])
  re_password = new FormControl('',[Validators.minLength(6)])

  constructor(private userService: UserService, private router: Router, private authService: AuthService) {
  }

  ngOnInit(): void {

  }

  deleteProfile() {
    this.userService.delete(this.loggedInUser.uid)//.then(_=> this.router.navigate(['/login']))
  }

  updateProfile() {
    if (this.password.value?.trim() !== '' && this.password.value?.trim().length as number >=6 && this.password.value?.trim() === this.re_password.value?.trim()){
      this.pwToSend = (this.password.value as string).trim();
    }
    if (this.username.value?.trim() !== ''){
      this.newUser.username = (this.username.value as string).trim();
    }
    if (this.email.value?.trim() !== ''){
      this.newUser.email = (this.email?.value as string).trim();
    }
    if (this.email.value?.trim() === this.loggedInUser.email){
      this.userService.update(this.newUser,this.pwToSend, false)
    }else {
      this.userService.update(this.newUser,this.pwToSend,true)
    }
  }
}
