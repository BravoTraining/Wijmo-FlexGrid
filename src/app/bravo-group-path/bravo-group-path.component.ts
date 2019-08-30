import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import * as WjCore from 'wijmo/wijmo';

import { MenuStrip } from '../controller/menustrip';
import { DropDown, ComboBox } from 'wijmo/wijmo.input';
import { BravoWebButton } from '../lib/ui/toolstrip/bravo.web.button';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';

@Component({
  selector: 'bravo-group-path',
  templateUrl: './bravo-group-path.component.html',
  styleUrls: ['./bravo-group-path.component.css']
})
export class BravoGroupPathComponent extends MenuStrip implements OnInit{

  constructor(private elRef: ElementRef) {
    super(elRef.nativeElement);
   }

  ngOnInit() {

  }
}
