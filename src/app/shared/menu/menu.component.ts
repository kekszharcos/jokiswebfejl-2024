import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, AfterViewInit{
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Input() currentPage!: string;
  constructor() {
    console.log("Konstruktor")
  }

  ngOnInit(): void {
    console.log("on Init")
  }

  ngAfterViewInit(): void {
    console.log("after view")
  }

  menuSwitch() {
    this.selectedPage.emit(this.currentPage)
  }
}
