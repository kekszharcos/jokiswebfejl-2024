import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {AuthService} from "./shared/services/auth.service";
import {MatSidenav} from "@angular/material/sidenav";
import {FriendService} from "./shared/services/friend.service";
import {User, authState} from '@angular/fire/auth';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'jokiswebfelj-2024';
  page = '';
  routes: Array<string> = [];
  showNavbar = true;
  private lastScrollTop = 0;
  loggedInUser: User | null = null;

  constructor(private router: Router, private authService: AuthService, private friendService: FriendService) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
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

    window.addEventListener('scroll', this.onWindowScroll, true);
  }

  logout($event: unknown) {
    this.authService.logout().then(() => {
      // handle successful logout if needed
    });
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }

  changePage($event: string) {

  }

  onClose($event: unknown, sidenav: MatSidenav) {
  if ($event === true) {
    sidenav.close();
  }
}

  onWindowScroll = (): void => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      this.showNavbar = false; // Scrolling down
    } else {
      this.showNavbar = true; // Scrolling up
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  };

    protected readonly location = location;
}
