import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {AuthService} from "./shared/services/auth.service";
import {MatSidenav} from "@angular/material/sidenav";
import {User, authState} from '@angular/fire/auth';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'jokiswebfelj-2024';
  page = '';
  routes: Array<string> = [];
  showNavbar = true;
  private lastScrollTop = 0;
  loggedInUser: User | null = null;
  
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  constructor(private router: Router, private authService: AuthService) {
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
  }
  ngAfterViewInit(): void {
    // Listen to scroll on the mat-sidenav-content instead of window
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onScrollContainerScroll, true);
  }

  ngOnDestroy(): void {
    // Clean up the event listener
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.onScrollContainerScroll, true);
    }
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
  onScrollContainerScroll = (): void => {
    const st = this.scrollContainer.nativeElement.scrollTop;
    const threshold = 10; // Only trigger after scrolling 10px
    
    if (Math.abs(st - this.lastScrollTop) > threshold) {
      if (st > this.lastScrollTop && st > 64) {
        this.showNavbar = false; // Scrolling down and past navbar height
      } else {
        this.showNavbar = true; // Scrolling up
      }
      this.lastScrollTop = st;
    }
  };

  protected readonly location = location;
}
