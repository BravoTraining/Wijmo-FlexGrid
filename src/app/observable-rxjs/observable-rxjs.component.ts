import { Component, OnInit } from '@angular/core';
import { of, fromEvent, from, interval, Subscription, pipe} from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, filter, catchError, retry } from 'rxjs/operators';


@Component({
  selector: 'app-observable-rxjs',
  templateUrl: './observable-rxjs.component.html',
  styleUrls: ['./observable-rxjs.component.css']
})
export class ObservableRxjsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.runObservable();
    this.eventFunction();
    this.fromPromiseFunction();
    this.intervalFunction();
    this.ajaxFunction();
    this.operatorFunction();
    this.retryFunction();
  }

  runObservable() {
    const myObservable = of(1, 2, 3);

    const myObserver = {
      next: x => console.log('Observer got a next value: ' + x),
      error: err => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification'),
    };

    myObservable.subscribe(x => console.log('Observer got a next value: ' + x),
    err => console.error('Observer got an error: ' + err),
    () => console.log('Observer got a complete notification'));
  }


  //formEvent
  eventFunction() {
    const ESC = 27;
    const pName = document.getElementById("p-title") as HTMLInputElement;
    const subscribe = fromEvent(pName, 'keydown').subscribe((e: KeyboardEvent) => {
      if(e.keyCode === ESC){
        pName.value = '';
      }
    });
  }

  //fromPromise
  fromPromiseFunction(){
    const data = from(fetch('http://localhost:3000/users'));
    

    const sub = (data.subscribe(
   { next(response) {console.log(response)},
    error(err) {console.error(err)},
    complete() { console.log("Success")}}
    ))
  }

  //interval
  intervalFunction(){
    const counter = interval(1000);
    const subscription = new Subscription();
    subscription.add(counter.subscribe(
      x => console.log("Timer" + x)
    ))
    setTimeout(function(){subscription.unsubscribe()}, 5000);
  }

  //ajax Observable
  ajaxFunction(){
    const data = ajax('http://localhost:3000/users');

    data.subscribe(res => console.log(res.status, res.response));
  }

  //Operator
  operatorFunction(){
    // const value = of(1, 2, 4, 16);
    // const mapValue = pipe( filter((val: number) => val % 2 == 0),
    //                   map(val => val * val));
    // const squenceMap = mapValue(value);

    const value = of(1, 2, 3, 4, 16).pipe(
        filter((val: number) => val % 2 ==0),
        map(val => val * val)
    )

    value.subscribe(val => console.log(val));

    // squenceMap.subscribe(val => console.log(val));
  }

  //retry failed
  retryFunction(){
    const apiData = ajax('http://localhost:3000/roles').pipe(
      retry(2), 
      map(res => {
        if (!res.response) {
          throw new Error('Value expected!');
        }
        return res.response;
      }),
      catchError(err => of([]))
    );
     
    apiData.subscribe({
      next(x) { console.log('data: ', x); },
      error(err) { console.log('errors already caught... will not run'); }
    });
  }
}
