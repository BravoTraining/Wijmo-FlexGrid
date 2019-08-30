import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import  ResizeSensor  from 'css-element-queries/src/ResizeSensor';
import { BravoGroupPathComponent } from '../bravo-group-path/bravo-group-path.component';

@Component({
  selector: 'app-app-resize',
  templateUrl: './app-resize.component.html',
  styleUrls: ['./app-resize.component.css']
})
export class AppResizeComponent implements OnInit, AfterViewInit {

  constructor() { }

  @ViewChild('resizableElement', {static: false})
  resizableElement: BravoGroupPathComponent;

  public elementSize: string;

  ngOnInit() {

  }

  ngAfterViewInit() {
    // ElementQueries.listen();
    // ElementQueries.init();
    let dom = document.getElementById('resize');

    this.elementSize = 'Width: ' + this.resizableElement.hostElement.clientWidth +
      ' Height: ' + this.resizableElement.hostElement.clientHeight;

    const resizeSensor = new ResizeSensor(this.resizableElement.hostElement, function(){console.log("=======")});
  }

}
