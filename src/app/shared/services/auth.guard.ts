import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const user = JSON.parse(localStorage.getItem('user') as string);
  const router = inject(Router); // <-- Correct way to get Router

  if (user) {
    return true;
  } else {
    router.navigateByUrl('/signup');
    return false;
  }
};
