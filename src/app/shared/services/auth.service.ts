import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, browserLocalPersistence, setPersistence, signInWithPopup, GoogleAuthProvider, linkWithCredential, AuthError } from '@angular/fire/auth';
import { updateProfile } from "firebase/auth";
import { UserService } from './user.service';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(public auth: Auth, private userService: UserService, private messageService: MessageService) {
    //setPersistence(this.auth, browserLocalPersistence); // or browserSessionPersistence
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then(async (result) => {
      //setPersistence(this.auth, browserLocalPersistence); // Ensure persistence is set after login
    });
  }

  signupUser(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
    
  }

  updateUser(user: User, username: string) {
    return updateProfile(user, { displayName: username });
  }

  logout() {
    return this.auth.signOut().then(() => {
      
    })
  }
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      
      // Check if user document exists in Firestore
      const doc = await this.userService.getUserById(result.user.uid);
      if (!doc.exists()) {
        // New Google user - create account
        await this.userService.create(result.user.email!, result.user.uid, result.user.displayName!);
      } else {
        // Existing user - update display name if needed
        await this.userService.updateData('', '', result.user.displayName!, false, false, true);
      }
      //setPersistence(this.auth, browserLocalPersistence); // Ensure persistence is set after login
      return result;
    } catch (error: any) {
      // Handle account-exists-with-different-credential error
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account with this email already exists. Please sign in with your original login method first, then link your Google account in your profile settings.');
      }
      throw error;
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
