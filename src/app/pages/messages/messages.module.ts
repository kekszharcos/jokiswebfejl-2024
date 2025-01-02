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
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatTooltip} from "@angular/material/tooltip";



@NgModule({
  declarations: [
    MessagesComponent,
    FromUserIdToNamePipe
  ],
  exports: [
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
    MatCardFooter,
    MatIcon,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatTooltip
  ]
})
export class MessagesModule { }
