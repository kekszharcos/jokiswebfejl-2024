import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {AuthService} from "./shared/services/auth.service";
import {LoadingService} from "./shared/services/loading.service";
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

  constructor(private router: Router, private authService: AuthService, public loadingService: LoadingService) {
    authState(this.authService.auth).subscribe(user => this.loggedInUser = user);
    
    // Initialize loading service to false by default
    this.loadingService.setLoading(false);
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
    // Add a small delay to ensure Angular Material components are fully rendered
    setTimeout(() => {
      this.setupScrollListener();
    }, 100);
  }

  private setupScrollListener(): void {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      // Listen to scroll on the content container div
      this.scrollContainer.nativeElement.addEventListener('scroll', this.onScrollContainerScroll, true);
      console.log('Scroll listener attached successfully to content container');
    } else {
      console.warn('ScrollContainer not found, using window scroll as fallback...');
      // Use window scroll as fallback
      window.addEventListener('scroll', this.onWindowScroll, true);
      console.log('Fallback: Window scroll listener attached');
    }
  }

  ngOnDestroy(): void {
    // Clean up the event listeners
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.onScrollContainerScroll, true);
    }
    // Also remove window listener in case it was used as fallback
    window.removeEventListener('scroll', this.onWindowScroll, true);
  }

  logout($event: unknown) {
    this.authService.logout().then(() => {
      // handle successful logout if needed
      this.router.navigate(['/signup']); // Redirect to signup page after logout
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
    // Add safety check to prevent errors
    if (!this.scrollContainer || !this.scrollContainer.nativeElement) {
      console.warn('ScrollContainer not available in scroll handler');
      return;
    }
    
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

  // Fallback window scroll handler
  onWindowScroll = (): void => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
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
