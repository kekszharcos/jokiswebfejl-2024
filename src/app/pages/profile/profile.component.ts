import { Component } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { AuthService } from "../../shared/services/auth.service";
import { User } from '@angular/fire/auth';
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { getAuth, deleteUser, updateEmail, updatePassword } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, onAuthStateChanged, authState } from '@angular/fire/auth';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    standalone: false
})
export class ProfileComponent {
  loggedInUser: User | null = null;
  pwToSend = '';
  username = new FormControl('', [Validators.minLength(3), Validators.required]);
  email = new FormControl('', [Validators.email, Validators.required]);
  password = new FormControl('', [Validators.minLength(6), Validators.required]);
  re_password = new FormControl('', [Validators.minLength(6), Validators.required]);

  profileForm = new FormGroup({
    username: this.username,
    email: this.email,
    password: this.password,
    re_password: this.re_password
  }, { validators: passwordMatchValidator });

  deleteError: string | null = null;
  saveError: string | null = null;

  constructor(private userService: UserService, private router: Router, private authService: AuthService, private dialog: MatDialog) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
    if (!this.loggedInUser) return;
    
    this.username.setValue(this.loggedInUser.displayName);
    this.email.setValue(this.loggedInUser.email);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete your profile?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteProfile();
      }
    });
  }

  deleteProfile() {
    this.deleteError = null;
    if (this.loggedInUser) {
      deleteUser(this.loggedInUser).then(() => {
        this.authService.logout().then(() => {
          //this.router.navigate(['/login']);
        });
      }).catch((error) => {
        if (error.code === 'auth/requires-recent-login') {
          this.deleteError = 'Please log out and log in again before deleting your account for security reasons.';
        } else {
          this.deleteError = 'Account deletion failed. Please try again or contact support.';
        }
      });
    }
  }

  updateProfile() {
    this.saveError = null;
    if (this.profileForm.invalid) {
      this.saveError = 'Please fix the errors in the form before saving.';
      this.profileForm.markAllAsTouched();
      return;
    }

    const newEmail = this.profileForm.value.email as string;
    const newPassword = this.profileForm.value.password as string;
    const newUsername = this.profileForm.value.username as string;
    let upEmail = false;
    let upPass = false;
    let upUsername = false;

    // 1. Update Auth profile first (if needed)
    
    if (this.loggedInUser) {
      if (newEmail && newEmail !== this.loggedInUser.email) {
        upEmail = true;
      }
      if (newPassword) {
        upPass = true;
      }
      if(newUsername && newUsername !== this.loggedInUser.displayName) {
        upUsername
      }
    } else {
      this.saveError = 'No authenticated user found. Please log in again.';
      return;
    }

    /*
    const promises: Promise<any>[] = [];
    Promise.all(promises)
      .then(() => {
        // 2. Only update Firestore/DB if Auth update succeeded
        this.userService.update(newEmail, newPassword, false).subscribe({
          next: () => {
            // Optionally show success
          },
          error: () => {
            this.saveError = 'Failed to save changes in the database. Please try again or contact support.';
          }
        });
      })
      .catch((err) => {
        if (err.code === 'auth/requires-recent-login') {
          this.saveError = 'Please log out and log in again before saving changes for security reasons.';
        } else {
          this.saveError = 'Failed to save changes. Please try again or contact support.';
        }
      });*/

      this.userService.update(newEmail, newPassword, newUsername, upEmail, upPass, upUsername).subscribe({
        next: () => {
          // Optionally show success
        },
        error: () => {
          this.saveError = 'Failed to save changes in the database. Please try again or contact support.';
        }
      });
  }

  confirmDeleteProfile() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete your account? This action cannot be undone.' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProfile();
      }
    });
  }
}

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const re_password = group.get('re_password')?.value;
  return password === re_password ? null : { passwordsMismatch: true };
};

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        router.navigateByUrl('/signup');
        resolve(false);
      }
    });
  });
};
