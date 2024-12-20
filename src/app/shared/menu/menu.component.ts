import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    standalone: false
})
export class MenuComponent implements OnInit, AfterViewInit{
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Input() currentPage!: string;
  @Output() onCloseSidenav = new EventEmitter<unknown>();
  @Input() loggedInUser!: firebase.default.User | null | undefined;
  @Output() onLogout = new EventEmitter<unknown>();
  constructor(private authService : AuthService) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  }

  menuSwitch() {
    this.selectedPage.emit(this.currentPage)
  }

  logout() {
    this.authService.logout()
  }

  close(){
    this.onCloseSidenav.emit(true)
  }
}
