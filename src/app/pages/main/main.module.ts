import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import {MainComponent} from "./main.component";
import {MatHint} from "@angular/material/form-field";


@NgModule({
  declarations:[
    MainComponent
  ],
    imports: [
        CommonModule,
        MainRoutingModule,
        MatHint
    ]
})
export class MainModule { }
