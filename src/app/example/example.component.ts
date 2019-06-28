import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-example',
  template: `
  <form [formGroup]="form">
  <select formControlName="state">
    <option *ngFor="let state of states" [ngValue]="state">
      {{ state.abbrev }}
    </option>
  </select>
</form>

 <p>Form value: {{ form.value | json }}</p> 
 <!-- {state: {name: 'New York', abbrev: 'NY'} } -->
`,
})
export class ExampleComponent implements OnInit {
  txtIn = '';
  states = [
    {name: 'Arizona', abbrev: 'AZ'},
    {name: 'California', abbrev: 'CA'},
    {name: 'Colorado', abbrev: 'CO'},
    {name: 'New York', abbrev: 'NY'},
    {name: 'Pennsylvania', abbrev: 'PA'},
  ];
 
  form = new FormGroup({
    state: new FormControl(this.states[3]),
  });
  constructor() { }

  ngOnInit() {
  }

}
