import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsComponent } from './groups.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatCheckbox } from '@angular/material/checkbox';

@NgModule({
  declarations: [ GroupsComponent ],
  exports: [],
  imports: [
    CommonModule,
    GroupsRoutingModule,
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
export class GroupsModule { }
