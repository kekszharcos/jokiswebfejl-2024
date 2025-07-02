import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {AuthService} from "../../shared/services/auth.service";
import {UserService} from "../../shared/services/user.service";
import {LoadingService} from "../../shared/services/loading.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css',
    standalone: false
})
export class SignupComponent {
  showLogin = true;
  currentHeightClass = 'login-height'; // Track height class separately
  isGoogleLoginLoading = false; // Add loading state for Google login
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

  constructor(private location:Location, private authService: AuthService, private userService: UserService, private router:Router, private loadingService: LoadingService) {
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
            this.userService.create(email, cred.user.uid, username).then(() => {
              console.log('Signup successful, starting app loading...');
              // Start global loading after successful signup
              this.loadingService.setLoading(true);
              
              // Navigate to main page
              this.router.navigateByUrl('main').then(() => {
                // Give a small delay to ensure page is fully loaded
                setTimeout(() => {
                  this.loadingService.setLoading(false);
                }, 500);
              });
            })
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

  loggingIn() {
    this.loginError = null;
    if (this.loginEmail.valid && this.loginPassword.valid){
      this.authService.login(this.loginEmail.value.trim(), this.loginPassword.value)
        .then(() => {
            console.log('Email login successful, starting app loading...');
            // Start global loading after successful authentication
            this.loadingService.setLoading(true);
            
            // Navigate to main page
            this.router.navigateByUrl('main').then(() => {
              // Give a small delay to ensure page is fully loaded
              setTimeout(() => {
                this.loadingService.setLoading(false);
              }, 500);
            });
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
      this.currentHeightClass = 'login-height'; // Change height simultaneously with content
      this.formAnimation = 'animate__fadeIn';
      this.showLogin = true;
    }, 300); // match animate.css duration
  }

  switchToSignup() {
    this.formAnimation = 'animate__fadeOut';
    this.loginError = null; // Reset login error when switching to signup
    setTimeout(() => {
      this.currentHeightClass = 'signup-height'; // Change height simultaneously with content
      this.formAnimation = 'animate__fadeIn';
      this.showLogin = false;
    }, 300); // match animate.css duration
  }

  cluck(){
    //this.isActive = !this.isActive
  }

  loginWithGoogle() {
    // Prevent multiple clicks
    if (this.isGoogleLoginLoading) {
      console.log('Google login already in progress, ignoring click');
      return;
    }

    this.loginError = null; // Clear any existing errors
    this.isGoogleLoginLoading = true;
    
    // Set a timeout to reset loading state in case of hanging promises
    const timeoutId = setTimeout(() => {
      if (this.isGoogleLoginLoading) {
        console.log('Google login timeout - resetting loading state');
        this.isGoogleLoginLoading = false;
        this.loadingService.setLoading(false); // Reset global loading too
        this.loginError = 'Login timed out. Please try again.';
      }
    }, 10000); // 10 second timeout
    
    this.authService.loginWithGoogle().then(cred => {
       clearTimeout(timeoutId);
       this.isGoogleLoginLoading = false;
       
       console.log('Google login successful, starting app loading...');
       // Start global loading after successful authentication
       this.loadingService.setLoading(true);
       
       // Navigate to main page - loading service will handle the transition
       this.router.navigateByUrl('main').then(() => {
         // Give a small delay to ensure page is fully loaded
         setTimeout(() => {
           this.loadingService.setLoading(false);
         }, 500); // Half second delay for smooth transition
       });
    }).catch(err => {
      clearTimeout(timeoutId);
      this.isGoogleLoginLoading = false;
      
      console.error('Signup component - Google login error:', err);
      
      // Handle specific error cases
      if (err.message.includes('cancelled by user')) {
        // Don't show error for user cancellation
        console.log('User cancelled login');
      } else if (err.message.includes('already in progress')) {
        this.loginError = 'Please wait, login is in progress...';
      } else if (err.message.includes('multiple times')) {
        this.loginError = 'Please wait a moment before trying again.';
      } else if (err.message) {
        this.loginError = err.message;
      } else {
        this.loginError = 'Google login failed. Please try again.';
      }
    });
  }
  
}
