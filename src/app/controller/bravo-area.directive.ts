import { Directive, NgZone, ElementRef, Renderer2 } from '@angular/core';
import { SplitAreaDirective } from '../lib/directive/splitArea.directive';
import { BravoSplitComponent } from './BravoComponent/bravo-split.component';

@Directive({
  selector: 'bravo-area, [bravo-area]',
  exportAs: 'bravoArea'
})
export class BravoAreaDirective extends SplitAreaDirective {

  constructor(protected ngZone: NgZone,
    public elRef: ElementRef,
    protected renderer: Renderer2,
    protected split: BravoSplitComponent) {

    super(ngZone, elRef, renderer, split);
  }

}
