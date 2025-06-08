import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "../../shared/services/auth.service";
import {User} from "../../shared/models/User";
import {UserService} from "../../shared/services/user.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css',
    standalone: false
})
export class SignupComponent {
  showLogin = true;
  //login
  loginEmail: FormControl = new FormControl('', Validators.required);
  loginPassword: FormControl = new FormControl('', [Validators.required,Validators.minLength(6)]);
  isActive = true;
  signupContainer: any ;
  loginContainer: any ;
  //signup
  signUpFrom = new FormGroup({
    email:new FormControl('',[Validators.email, Validators.required]),
    password:new FormControl('',[Validators.minLength(6), Validators.required]),
    password_re:new FormControl('',[Validators.minLength(6), Validators.required]),
  })

  constructor(private location:Location, private authService: AuthService, private userService: UserService, private router:Router) {

    this.signupContainer = document.getElementById('signup-container');
    this.loginContainer =  document.getElementById('login-container');

  }
  onSubmit() {
    if (this.signUpFrom.get('email')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() === this.signUpFrom.get('password_re')?.value?.trim()){
      this.authService.signup(
        this.signUpFrom.get('email')?.value as string,
        this.signUpFrom.get('password')?.value as string
      ).subscribe({
        next: (cred) => {
          const user: User = {
            id: cred.user?.uid as string,
            email: this.signUpFrom.get('email')?.value as string,
            username: this.signUpFrom.get('email')?.value?.split('@')[0] as string
          };
          this.userService.create(user).subscribe({
            next: _ => {
              this.router.navigateByUrl('main');
            },
            error: err => {
              // handle error
            }
          });
        },
        error: (err) => {
          // handle signup error
        }
      });
    }

  }
  goBack(){
    this.location.back()
  }

  goToLogin(){
    this.signupContainer.style.display = 'none';
    this.loginContainer.style.display = 'block';
  }
  goToSignup() {
    console.log(this.signupContainer)
    this.loginContainer!.style.display = 'none';
    this.signupContainer!.style.display = 'block';
  }

  loggingIn() {
    console.log(this.loginEmail,this.loginPassword)
    if (this.loginEmail.valid && this.loginPassword.valid){
      this.authService.login(this.loginEmail.value.trim(),this.loginPassword.value)
        //.then(r => {this.router.navigateByUrl("/main");})
    }
  }

  cluck(){
    //this.isActive = !this.isActive
  }

}
