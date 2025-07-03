import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signInWithPopup, GoogleAuthProvider, linkWithCredential, AuthError, connectAuthEmulator } from '@angular/fire/auth';
import { updateProfile, setPersistence, browserLocalPersistence, UserCredential } from "firebase/auth";
import { UserService } from './user.service';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isGoogleLoginInProgress = false; // Prevent multiple simultaneous attempts
  
  constructor(public auth: Auth, private userService: UserService, private messageService: MessageService) {
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signupUser(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
    
  }

  updateUser(user: User, username: string) {
    return updateProfile(user, { displayName: username });
  }

  logout() {
    return this.auth.signOut()
  }
  async loginWithGoogle(): Promise<any> {
    // Prevent multiple simultaneous login attempts
    if (this.isGoogleLoginInProgress) {
      console.log('Google login already in progress, ignoring duplicate request');
      throw new Error('Login already in progress. Please wait...');
    }

    try {
      this.isGoogleLoginInProgress = true;
      console.log('Starting Google login...');
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Attempting signInWithPopup...');
      
      // Add immediate popup detection
      const popupPromise = signInWithPopup(this.auth, provider);
      
      // Create a faster timeout for popup closure detection
      const quickTimeout = setTimeout(() => {
        if (this.isGoogleLoginInProgress) {
          console.log('Popup may have been closed - checking...');
        }
      }, 1000); // Check after 1 second
      
      const result = await popupPromise;
      clearTimeout(quickTimeout);
     
      console.log('Google login successful, user:', result.user.email);
      console.log('Checking user document...');
      
      // Check if user document exists in Firestore
      const doc = await this.userService.getUserById(result.user.uid);
      if (!doc.exists()) {
        console.log('Creating new user document...');
        // New Google user - create account
        await this.userService.create(result.user.email!, result.user.uid, result.user.displayName!);
        console.log('User document created successfully');
      } else {
        console.log('User document exists, updating display name...');
        // Existing user - update display name if needed
        await this.userService.updateData('', '', result.user.displayName!, false, false, true);
      }
      
      this.isGoogleLoginInProgress = false; // Reset flag on success
      return result;
    } catch (error: any) {
      this.isGoogleLoginInProgress = false; // Reset flag on error
      
      // Handle specific Google Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup - immediate reset');
        // Immediate error for faster UI response
        const cancelError = new Error('Login cancelled by user');
        cancelError.name = 'PopupCancelled';
        throw cancelError;
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup was blocked by browser');
        throw new Error('Popup blocked by browser. Please allow popups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled - likely due to multiple attempts');
        throw new Error('Please wait a moment and try again. Avoid clicking multiple times.');
      } else if (error.code === 'auth/network-request-failed') {
        console.log('Network error during login - preventing reload');
        // Create a custom error that won't cause page reload
        const networkError = new Error('Network connection issue. Please check your internet connection and try again.');
        networkError.name = 'NetworkError';
        throw networkError;
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        console.log('Account exists with different credential');
        throw new Error('An account with this email already exists. Please sign in with your original login method first, then link your Google account in your profile settings.');
      } else {
        console.log('Unknown Google login error:', error.code);
        throw new Error(`Login failed: ${error.message}`);
      }
    }
  }
  // Method to link Google account to existing email/password account
  async linkGoogleAccount(): Promise<User> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        const linkedUser = await linkWithCredential(currentUser, credential);
        console.log('Google account linked successfully');
        return linkedUser.user;
      } else {
        throw new Error('Failed to get Google credential');
      }
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This Google account is already linked to another user');
      }
      throw error;
    }
  }

  isUserLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isGoogleUser(): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return user.providerData.some(provider => provider.providerId === 'google.com');
  }

  isEmailPasswordUser(): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return user.providerData.some(provider => provider.providerId === 'password');
  }

  getUserProviders(): string[] {
    const user = this.auth.currentUser;
    if (!user) return [];
    return user.providerData.map(provider => provider.providerId);
  }

  // Check if user can link Google account (i.e., is email/password user)
  canLinkGoogleAccount(): boolean {
    return this.isEmailPasswordUser() && !this.isGoogleUser();
  }

  // Check if user has multiple sign-in methods
  hasMultipleProviders(): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return user.providerData.length > 1;
  }

}
