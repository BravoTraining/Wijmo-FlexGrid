import { Component, OnInit } from '@angular/core';
import { of, concat, interval, zip, iif, Observable, observable, timer} from 'rxjs';
import { delay, take, map, combineAll, concatAll, endWith, finalize, pairwise, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-combination',
  templateUrl: './combination.component.html',
  styleUrls: ['./combination.component.css']
})
export class CombinationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // this.concatFunction();
    // this.combineAllFunc();
    // this.concatAllFunction();
    // this.startEndWith();
    // this.pairwiseFunction();
    // this.zipFunction();
    // this.iifFunction();
    // this.createFuntion();
    this.timerFunction();
  }

  //combineAll
  combineAllFunc() {
    const source = interval(1000).pipe(take(2));

    const example = source.pipe(
      map(val => interval(1000).pipe(
        map(i => `Result (${val}): ${i}`), take(5)
        )));

    const process = example.pipe(combineAll());
    process.subscribe(val => console.log(val));
  }

  //concat
  concatFunction() {
    concat(of(3, 2, 1), of('Bravo', 'Software', 'Company')).subscribe(console.log);
    
    // concat(of(3, 2, 1).pipe(delay(3000)), of('Bravo', 'Software', 'Company')).subscribe(console.log);

    //warring not pause
    // concat(interval(1000), of('Bravo', 'Software', 'Company')).subscribe(console.log);
  }

  //concatAll
  concatAllFunction() {
    const source = interval(1000);

    const example = source.pipe(map(val => of(val + 10)), concatAll());
    example.subscribe(val => console.log(val));
  }

  //start-end_With
  startEndWith() {
    // const source = of('Bravo', 'Software', 'Company');

    // const example = source.pipe(endWith('Hander', 'Berry'));
    // example.subscribe( v => console.log(v));
    const source$ = of('Hello', 'Friend');

    source$.pipe(
    endWith('Goodbye', 'Friend'),
    finalize(() => console.log('Finallyy')))
  .subscribe(val => console.log(val));
  }

  //pairwise 
  pairwiseFunction() {
    const source = interval(1000).pipe(pairwise(), take(3)).subscribe(console.log);
  }
  //zip

  zipFunction() {
    const ob1 = of('Hello', 'to');
    const ob2 = of('World');
    const ob3 = of('Hello');
    const ob4 = of('Bravo');

    const example = zip (
      ob1,
      ob2.pipe(delay(1000)),
      ob3.pipe(delay(2000)),
      ob4.pipe(delay(3000))
    );
      example.subscribe(val => console.log(val));
  }

  iifFunction() {
    const x$ = of('X');
    const r$ = of('R');

    interval(1000).pipe(mergeMap(val => iif(() => val % 4 === 0, r$, x$)))
      .subscribe(console.log);
  }

  //create
  createFuntion() {
    const hello = Observable.create(function(observer){
      observer.next('Hello');
      observer.next('Bravo');
      observer.complete();
    })
    hello.subscribe(val => console.log(val));
  }

  //timer
  timerFunction() {
    timer(5000, 4000).subscribe(console.log);
  }
}
