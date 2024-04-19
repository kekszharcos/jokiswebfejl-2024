import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesComponent } from './messages.component';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import {FlexModule} from "@angular/flex-layout";
import {FromUserIdToNamePipe} from "../../shared/pipes/from-user-id-to-name.pipe";
import {MatDrawer, MatDrawerContainer} from "@angular/material/sidenav";



@NgModule({
  declarations: [
    MessagesComponent,
    FromUserIdToNamePipe
  ],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCard,
    FlexModule,
    MatCardContent,
    MatCardHeader,
    MatDrawerContainer,
    MatDrawer,
    MatCardFooter
  ]
})
export class MessagesModule { }
