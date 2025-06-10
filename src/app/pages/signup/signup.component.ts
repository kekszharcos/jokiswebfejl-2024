import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "../../shared/services/auth.service";
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
  loginError: string | null = null;
  //signup
  signUpFrom = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password_re: new FormControl('', [Validators.required, Validators.minLength(6)]),
  })

  formAnimation = 'animate__fadeIn';

  constructor(private location:Location, private authService: AuthService, private userService: UserService, private router:Router) {
    this.signupContainer = document.getElementById('signup-container');
    this.loginContainer =  document.getElementById('login-container');
  }
  onSubmit() {
    if (this.signUpFrom.get('email')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() !== "" && this.signUpFrom.get('password')?.value?.trim() === this.signUpFrom.get('password_re')?.value?.trim()){
      const email = this.signUpFrom.get('email')?.value as string;
      const password = this.signUpFrom.get('password')?.value as string;
      const username = this.signUpFrom.get('email')?.value?.split('@')[0] as string;
      
      this.authService.signupUser(email, password, username).then(cred => {
        this.authService.updateUser(cred.user, username).then(() => {
            this.userService.create(email, cred.user.uid, username).then(() => this.router.navigateByUrl('main'))
        })
      })
      /*.then((cred) => {
          const user: User = {
            uid: cred.user?.uid as string,
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
        }).catch(() => {
          // handle signup error
        });*/
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
    this.loginContainer!.style.display = 'none';
    this.signupContainer!.style.display = 'block';
  }

  loggingIn() {
    this.loginError = null;
    if (this.loginEmail.valid && this.loginPassword.valid){
      this.authService.login(this.loginEmail.value.trim(), this.loginPassword.value)
        .then(() => {
            this.router.navigateByUrl('main'); // Navigate to main page on success
          }).catch((err) => {
           if (err.code === 'auth/user-not-found') {
              this.loginError = 'No user found with this email.';
            } else if (err.code === 'auth/wrong-password') {
              this.loginError = 'Incorrect password.';
            } else if (err.code === 'auth/invalid-email') {
              this.loginError = 'Invalid email address.';
            } else {
              this.loginError = 'Login failed. Please try again.';
            }
           
          })
    }
  }

  switchToLogin() {
    this.formAnimation = 'animate__fadeOut';
    setTimeout(() => {
      this.showLogin = true;
      this.formAnimation = 'animate__fadeIn';
    }, 300); // match animate.css duration
  }

  switchToSignup() {
    this.formAnimation = 'animate__fadeOut';
    setTimeout(() => {
      this.showLogin = false;
      this.formAnimation = 'animate__fadeIn';
    }, 300);
  }

  cluck(){
    //this.isActive = !this.isActive
  }

}
