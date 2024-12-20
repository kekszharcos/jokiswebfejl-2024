import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {AuthService} from "./shared/services/auth.service";
import {MatSidenav} from "@angular/material/sidenav";
import {FriendService} from "./shared/services/friend.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'jokiswebfelj-2024';
  page = '';
  routes: Array<string> = [];
  loggedInUser?: firebase.default.User | null;

  constructor(private router: Router, private authService: AuthService, private friendService: FriendService) {
  }

  pageSelect(selectedPage: string) {
    this.router.navigateByUrl(selectedPage);
  }

  ngOnInit(): void {
    //kiszedi hogy milyen routok vannak
    this.routes = this.router.config.map(conf => conf.path) as string[];
    //mas
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((evts: any) => {
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if (this.routes.includes(currentPage)) {
        this.page = currentPage;
      }
    })
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user
      localStorage.setItem('user', JSON.stringify(this.loggedInUser))

    }, error => {
      localStorage.setItem('user', 'null')
      localStorage.setItem('friends', 'null')
    })
  }

  logout($event: unknown) {
    this.authService.logout().then(() => {
    })
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }

  changePage($event: string) {

  }

  onClose($event: unknown, sidenav: MatSidenav) {
    if ($event === true) {
      sidenav.close()
    }
  }

    protected readonly location = location;
}
