import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'jokiswebfelj-2024';
  page = '';
  routes : Array<String> = [];

  constructor(private router:Router) {

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
      if (this.routes.includes(currentPage)){
        this.page = currentPage;
      }
    })
  }
}
