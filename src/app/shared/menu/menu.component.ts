import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import { User } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css',
    standalone: false
})
export class MenuComponent implements OnInit {
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Input() currentPage!: string;
  @Output() onCloseSidenav = new EventEmitter<boolean>(); // More specific type
  @Output() onLogout = new EventEmitter<void>(); // More specific type
  loggedInUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Use authState for reactive updates
    authState(this.authService.auth).subscribe(user => {
      this.loggedInUser = user;
    });
  }

  menuSwitch() {
    this.selectedPage.emit(this.currentPage);
  }

  async logout() {
    try {
      await this.authService.logout();
      this.onLogout.emit(); // Emit after successful logout
      this.close(); // Close menu after logout
      this.router.navigate(['/signup']); // Redirect to signup page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  close() {
    this.onCloseSidenav.emit(true);
  }
}
