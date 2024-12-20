import {NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MenuComponent } from './shared/menu/menu.component';
import { MainModule } from './pages/main/main.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire/compat";
import { MatSidenavModule} from "@angular/material/sidenav";
import { MatToolbarModule} from "@angular/material/toolbar";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatListModule} from "@angular/material/list";
import { PeopleComponent } from './pages/people/people.component';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import {MatInput, MatLabel} from "@angular/material/input";
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
    AngularFireModule.initializeApp(environment.firebaseConfig),
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
    MatCardContent,
    MatIcon
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
