import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import {GroupsModule} from "../groups/groups.module";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    MatCard,
    MatCardHeader,
    GroupsModule,
    MatButton,
    MatCardContent,
    MatLabel,
    MatFormField,
    MatInput,
    MatCardFooter,
    ReactiveFormsModule,
    MatError
  ]
})
export class ProfileModule { }
