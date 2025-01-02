import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import {MainComponent} from "./main.component";
import {MatHint} from "@angular/material/form-field";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {ExtendedModule} from "@angular/flex-layout";


@NgModule({
  declarations:[
    MainComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatHint,
    MatButtonModule,
    ExtendedModule
  ]
})
export class MainModule { }
