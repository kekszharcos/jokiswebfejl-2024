import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MenuComponent } from './shared/menu/menu.component';
import { MainModule } from './pages/main/main.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire/compat";
import { MatSidenavModule} from "@angular/material/sidenav";
import { MatToolbarModule} from "@angular/material/toolbar";
import { MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatListModule} from "@angular/material/list";
import { PeopleComponent } from './pages/people/people.component';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import {MatInput, MatLabel} from "@angular/material/input";

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    PeopleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainModule,
    FormsModule,
    AngularFireModule.initializeApp({
      "projectId": "jokiswebfejl-2024",
      "appId": "1:395342193033:web:f719a85cb2a660d3fc4158",
      "storageBucket": "jokiswebfejl-2024.appspot.com",
      "apiKey": "AIzaSyDPrACOkNe68D7eTO-QkOq8z--4Bzgxg-4",
      "authDomain": "jokiswebfejl-2024.firebaseapp.com",
      "messagingSenderId": "395342193033",
      "measurementId": "G-12MMW3MTKL"
    }),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatListModule,
    MatCard,
    MatInput,
    ReactiveFormsModule,
    MatLabel,
    MatCardHeader,
    MatCardFooter,
    MatCardContent
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
