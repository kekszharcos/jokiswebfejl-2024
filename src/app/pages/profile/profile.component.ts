import { Component, OnInit } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { AuthService } from "../../shared/services/auth.service";
import { User } from "../../shared/models/User";
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { getAuth, deleteUser, updateEmail, updatePassword } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    standalone: false
})
export class ProfileComponent implements OnInit {
  loggedInUser!: User;
  newUser!: User;
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

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      if (!user) return;
      this.loggedInUser = {
        id: user.uid,
        username: user.displayName || user.email?.split('@')[0] || '',
        email: user.email || ''
      };
      this.newUser = { ...this.loggedInUser };
      this.username.setValue(this.loggedInUser.username);
      this.email.setValue(this.loggedInUser.email);
    });
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
    this.userService.delete(this.loggedInUser.id).subscribe({
      next: () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          deleteUser(user).then(() => {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/login']);
            });
          }).catch((error) => {
            if (error.code === 'auth/requires-recent-login') {
              this.deleteError = 'Please log out and log in again before deleting your account for security reasons.';
            } else {
              this.deleteError = 'Account deletion failed. Please try again or contact support.';
            }
          });
        }
      },
      error: () => {
        this.deleteError = 'Account deletion failed. Please try again or contact support.';
      }
    });
  }

  updateProfile() {
    this.saveError = null;
    if (this.profileForm.invalid) {
      this.saveError = 'Please fix the errors in the form before saving.';
      this.profileForm.markAllAsTouched();
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    const newEmail = this.profileForm.value.email as string;
    const newPassword = this.profileForm.value.password as string;
    const newUsername = this.profileForm.value.username as string;

    // 1. Update Auth profile first (if needed)
    const promises: Promise<any>[] = [];
    if (user) {
      if (newEmail && newEmail !== this.loggedInUser.email) {
        promises.push(updateEmail(user, newEmail));
      }
      if (newPassword) {
        promises.push(updatePassword(user, newPassword));
      }
    } else {
      this.saveError = 'No authenticated user found. Please log in again.';
      return;
    }

    Promise.all(promises)
      .then(() => {
        // 2. Only update Firestore/DB if Auth update succeeded
        const updatedUser: User = {
          id: this.loggedInUser.id,
          username: newUsername,
          email: newEmail,
        };
        this.userService.update(updatedUser, '', false).subscribe({
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
