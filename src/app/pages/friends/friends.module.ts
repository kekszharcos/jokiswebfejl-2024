import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FriendsRoutingModule } from './friends-routing.module';
import { FriendsComponent } from './friends.component';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFormField, MatFormFieldModule, } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatCheckbox } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    FriendsComponent
  ],
    imports: [
        CommonModule,
        FriendsRoutingModule,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatCardHeader,
        MatIconModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatCardModule,
        MatDrawerContainer,
        MatDrawer,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckbox,
        MatListModule,
        MatDrawerContent
    ]
})
export class FriendsModule { }
