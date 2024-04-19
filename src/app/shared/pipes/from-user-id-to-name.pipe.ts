import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'fromUserIdToName'
})
export class FromUserIdToNamePipe implements PipeTransform {
  constructor(private userService: UserService) { }

  transform(uid: string): Observable<string> {
    return this.userService.getUserById(uid).pipe(
      map(value => value[0].username)
    );
  }
}
