import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeopleRoutingModule } from './people-routing.module';
import {MatIcon} from "@angular/material/icon";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PeopleRoutingModule,
    MatIcon
  ]
})
export class PeopleModule { }
