import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {authGuard} from "./shared/services/auth.guard";

const routes: Routes = [
  {path: 'not-found', loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule)},
  {
    path: 'friends',
    loadChildren: () => import('./pages/friends/friends.module').then(m => m.FriendsModule),
    canActivate: [authGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then(m => m.MessagesModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
    canActivate: []
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule),
    canActivate: [authGuard]
  },
  {
    path: 'people',
    loadChildren: () => import('./pages/people/people.module').then(m => m.PeopleModule),
    canActivate: []
  },
  {path: 'signup', loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupModule)},
  {path: '', redirectTo: '/signup', pathMatch: 'full'},
  {path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
