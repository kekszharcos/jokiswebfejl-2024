import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "../../shared/services/auth.service";
import {User} from "../../shared/models/User";
import {UserService} from "../../shared/services/user.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  standalone: false
})
export class SignupComponent {
  //login
  loginEmail: FormControl = new FormControl('', Validators.required);
  loginPassword: FormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  isActive = true;
  isSignupVisible = false;
  //signup
  signUpFrom = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.minLength(6), Validators.required]),
    password_re: new FormControl('', [Validators.minLength(6), Validators.required]),
  })

  constructor(private location: Location, private authService: AuthService, private userService: UserService, private router: Router, public dialog: MatDialog) {

  }

  onSubmit() {
    if (this.signUpFrom.get('email')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() === this.signUpFrom.get('password_re')?.value?.trim()) {
      this.authService.signup((this.signUpFrom.get('email')?.value as string), (this.signUpFrom.get('password')?.value as string)).then(cred => {
        const user: User = {
          id: cred.user?.uid as string,
          email: this.signUpFrom.get('email')?.value as string,
          username: this.signUpFrom.get('email')?.value?.split('@')[0] as string
        }
        this.userService.create(user).then(_ => {
          this.router.navigateByUrl('main')
        }).catch(err => {

        })
      })
    }

  }

  goBack() {
    this.location.back()
  }

  goToLogin() {
    this.isSignupVisible = false
  }

  goToSignup() {
    this.isSignupVisible = true
  }

  loggingIn() {
    if (this.loginEmail.valid && this.loginPassword.valid) {
      this.authService.login(this.loginEmail.value.trim(), this.loginPassword.value)
        .then(r => {
          this.router.navigateByUrl("/main");
        }).catch(err => {

      })
    }
  }


}
