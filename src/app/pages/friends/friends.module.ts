import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FriendsRoutingModule } from './friends-routing.module';
import { FriendsComponent } from './friends.component';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader} from "@angular/material/card";


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
        MatCardHeader
    ]
})
export class FriendsModule { }
