import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthService} from "../services/auth.service";
import { User } from '@angular/fire/auth';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css',
    standalone: false
})
export class MenuComponent {
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Input() currentPage!: string;
  @Output() onCloseSidenav = new EventEmitter<unknown>();
  loggedInUser: User | null;
  @Output() onLogout = new EventEmitter<unknown>();
  constructor(private authService : AuthService) {
    this.loggedInUser = authService.auth.currentUser;
  }

  menuSwitch() {
    this.selectedPage.emit(this.currentPage)
  }

  logout() {
    this.authService.logout()
  }

  close(){
    this.onCloseSidenav.emit(true);
  }
}
