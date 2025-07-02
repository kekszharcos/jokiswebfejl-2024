import { Component } from '@angular/core';
import { UserService } from "../../shared/services/user.service";
import { AuthService } from "../../shared/services/auth.service";
import { User } from '@angular/fire/auth';
import { FormControl, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { deleteUser } from '@angular/fire/auth';
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

  successMessage: string | null = null;  constructor(private userService: UserService, private router: Router, public authService: AuthService, private dialog: MatDialog) {
    authState(this.authService.auth).subscribe(user => {
      this.loggedInUser = user;
      if (user) {
        this.username.setValue(user.displayName);
        this.email.setValue(user.email);
        
        // Update form validators based on login method
        this.updateFormValidators();
      }
    });
  }

  private updateFormValidators() {
    if (this.authService.isGoogleUser() && !this.authService.hasMultipleProviders()) {
      // Google-only user: remove password requirements
      this.password.clearValidators();
      this.re_password.clearValidators();
      this.password.setValue('');
      this.re_password.setValue('');
    } else {
      // Email/password or linked account: keep password requirements
      this.password.setValidators([Validators.minLength(6), Validators.required]);
      this.re_password.setValidators([Validators.minLength(6), Validators.required]);
    }
    
    this.password.updateValueAndValidity();
    this.re_password.updateValueAndValidity();
    this.profileForm.updateValueAndValidity();
  }

  async deleteProfile() {
    this.deleteError = null;
    if (!this.loggedInUser) return;

    try {
      await deleteUser(this.loggedInUser);
      // Only if Firebase Auth deletion succeeded, delete from Firestore
      await this.userService.delete(this.loggedInUser.uid);
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        this.deleteError = 'Please log out and log in again before deleting your account for security reasons.';
      } else {
        this.deleteError = 'Account deletion failed. Please try again or contact support.';
      }
    }
  }
  async updateProfile() {
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

    if (this.loggedInUser) {
      if (newEmail && newEmail !== this.loggedInUser.email) {
        upEmail = true;
      }
      
      // Only update password for email/password users or linked accounts
      if (newPassword && (this.authService.isEmailPasswordUser() || this.authService.hasMultipleProviders())) {
        upPass = true;
      }
      
      if(newUsername && newUsername !== this.loggedInUser.displayName) {
        upUsername = true;
      }
    } else {
      this.saveError = 'No authenticated user found. Please log in again.';
      return;
    }

    try {
      await this.userService.updateData(newEmail, newPassword, newUsername, upEmail, upPass, upUsername);
      this.successMessage = 'Profile updated successfully.';
      
      // Clear password fields after successful update
      if (upPass) {
        this.password.setValue('');
        this.re_password.setValue('');
      }
    } catch (error: any) {
      this.saveError = error.message || 'Failed to update profile. Please try again.';
    }
  }
  async linkGoogleAccount() {
    try {
      await this.authService.linkGoogleAccount();
      this.successMessage = 'Google account linked successfully! You can now sign in with either method.';
      this.saveError = null;
      
      // Update form validators since user now has multiple providers
      this.updateFormValidators();
    } catch (error: any) {
      this.saveError = error.message || 'Failed to link Google account. Please try again.';
      this.successMessage = null;
    }
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