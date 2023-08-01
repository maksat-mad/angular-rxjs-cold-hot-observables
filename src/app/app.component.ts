import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, shareReplay, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
		<p>Count: {{ (posts$ | async)?.length }}</p>
		<ul>
			<li *ngFor="let post of posts$ | async">{{ post.title }}</li>
		</ul>
	`,
  styles: [``]
})
export class AppComponent implements OnInit, OnDestroy {
  // Cold observables start to emit values when we subscribe to them
  // Hot observables emit always

  // Cold observables unicast
  // Hot observables multicast (share value between multiple subscribers)

	posts$!: Observable<any>;
  ngDestroy$ = new Subject<void>();

	constructor(private http: HttpClient) {}

  ngOnInit() {
		this.posts$ = this.http.get<any[]>('https://jsonplaceholder.typicode.com/posts').pipe(shareReplay());
    const observable$ = this.fromTimestamp();
		observable$.pipe(takeUntil(this.ngDestroy$)).subscribe({
			next: (value) => console.log(value)
		});

		setTimeout(() => {
			observable$.pipe(takeUntil(this.ngDestroy$)).subscribe({
				next: (value) => console.log(value)
			});
		}, 2000);
  }

  fromTimestamp(): Observable<number> {
		// Cold
		// Data source is created and activated inside of Observable
    // return new Observable((subscriber) => {
    //   const timestamp = Date.now();
    //   subscriber.next(timestamp);
    // });

		// Hot
		// Data source is created and activated outside of Observable
		const timestamp = Date.now();
		return new Observable((subscriber) => {
      subscriber.next(timestamp);
    });
  }

  ngOnDestroy() {
		this.ngDestroy$.next();
		this.ngDestroy$.complete();
  }
}
