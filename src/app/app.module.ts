import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { MenuComponent } from './shared/menu/menu.component';
import { MainModule } from './pages/main/main.module';
import { PeopleComponent } from './pages/people/people.component';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    PeopleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainModule,
    FormsModule,
    ReactiveFormsModule,

    // Angular Material modules
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatInputModule
  ],
  providers: [
    provideAnimationsAsync(),
    // Modular Firebase providers (no compat modules!)
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
