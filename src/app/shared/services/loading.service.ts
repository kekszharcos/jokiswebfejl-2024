import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  // Waits for all Promises to resolve before setting loading to false
  waitForAll(promises: Promise<any>[]) {
    this.loadingSubject.next(true);
    Promise.all(promises)
      .then(() => this.loadingSubject.next(false))
      .catch(() => this.loadingSubject.next(false));
  }

  setLoading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }
}
