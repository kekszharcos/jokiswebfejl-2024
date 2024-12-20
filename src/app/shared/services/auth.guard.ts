import {CanActivateFn, Router} from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const user = JSON.parse(localStorage.getItem('user') as string)
  let router: Router = new Router();
  if (user){
    return true;
  }else {
    router.navigateByUrl('/signup')
    return false;
  }

};
