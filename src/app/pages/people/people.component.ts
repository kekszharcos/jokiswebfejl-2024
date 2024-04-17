import {Component, OnInit} from '@angular/core';
import {UserService} from "../../shared/services/user.service";
import {User} from "../../shared/models/User";

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent implements OnInit {
  everyone: User[] = [];

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.get().subscribe(value => {
      this.everyone = value
      console.log(this.everyone)
    })

  }

}
