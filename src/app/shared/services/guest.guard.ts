import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Quick synchronous check first
  if (auth.currentUser) {
    router.navigateByUrl('/main'); // Redirect logged-in users to main page
    return false;
  }

  // Fallback to observable-based check for edge cases
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        // User is logged in, redirect to main and block access
        router.navigateByUrl('/main');
        return false;
      } else {
        // User is not logged in, allow access to signup
        return true;
      }
    })
  );
};
