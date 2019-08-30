import { Component, NgZone, ElementRef, Renderer2, ChangeDetectorRef, Input, HostListener, OnInit } from '@angular/core';
import { getPointFromEvent, getElementPixelSize, getGutterSideAbsorptionCapacity, updateAreaSize } from '../../lib/utils';
import { IAreaSnapshot, IOutputAreaSizes, IPoint } from '../../lib/interface';
import { SplitComponent } from '../../lib/component/split.component';
import { BravoAreaDirective } from '../../controller/bravo-area.directive';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';
import { isNullOrUndefined, isNull, isString } from 'util';

@Component({
  selector: 'bravo-split, [bravo-split]',
  exportAs: 'bravosplit',
  styleUrls: ['./bravo-split.component.scss'],
  templateUrl: './bravo-split.component.html'
})

export class BravoSplitComponent extends SplitComponent {
  private _bIsHidden: true | false = true; // show and hide gutter visual
  private _nGutterPos: number; // position gutter visual when dragging
  private _nLeftPos: number;  // position mouse in div margin left
  private _nTopPos: number;  // position mouse in div margin top
  private _nGutterOrder: number;
  private _defaultAreaSizes;



  // set refresh style panel when dragging or not, default false.
  private _isRefreshStyle: true | false = false;

  @Input() set refreshStyle(value: true | false) {
    this._isRefreshStyle = value;
  }

  get refreshStyle(): true | false {
    return this._isRefreshStyle;
  }

  private _zCollapseDir: 'left' | 'top' | 'right' | 'bottom';

  @Input() set collapseDir(value: 'left' | 'top' | 'right' | 'bottom') {
    this._zCollapseDir = value;
  }

  get collapseDir(): 'left' | 'top' | 'right' | 'bottom' {
    return this._zCollapseDir;
  }

  private _color: string = "rgba(255, 255, 255, 0.1)";

  @Input() set color(value: string) {
    this._color = value;
  }

  get color() {
    return this._color;
  }

  constructor(protected ngZone: NgZone,
    protected elRef: ElementRef,
    protected cdRef: ChangeDetectorRef,
    protected renderer: Renderer2) {

    super(ngZone, elRef, cdRef, renderer);
  }

  public ngAfterViewInit() {
    this.build(true, true);
    this._defaultAreaSizes = this.getVisibleAreaSizes();
  }

  // Set gutter size;
  _gutterSize = 3;

  public collapsePanel() {
    let _areaSizes = this.displayedAreas.map((area) => {
      return area.size;
    })

    let _currentOutputAreaSizes = this.getVisibleAreaSizes();

    let _nTotalSize = 0;
    let _nIdxAreaAuto: number;
    _areaSizes.forEach((size, idx) => {
      if (isNull(size)) {
        _nIdxAreaAuto = idx;
      }
      else {
        _nTotalSize += size;
      }
    })

    let _nIndexArea = (this._nGutterOrder + 1) / 2;

    if (this._direction === 'horizontal') {
      if (!isNullOrUndefined(_nIdxAreaAuto)) {
        _areaSizes[_nIdxAreaAuto] = (this.elRef.nativeElement.offsetWidth)
          - _nTotalSize - (this._gutterSize * (_areaSizes.length - 1));
      }
    }
    else {
      if (!isNullOrUndefined(_nIdxAreaAuto)) {
        _areaSizes[_nIdxAreaAuto] = (this.elRef.nativeElement.offsetHeight)
          - _nTotalSize - (this._gutterSize * (_areaSizes.length - 1));
      }
    }
    this.setNewAreaSize(_currentOutputAreaSizes, _nIndexArea, _areaSizes);

    if (!isNullOrUndefined(_nIdxAreaAuto)) {
      _currentOutputAreaSizes[_nIdxAreaAuto] = "*";
    }

    this.setVisibleAreaSizes(_currentOutputAreaSizes);
  }

  private setNewAreaSize(_currentOutputAreaSizes: IOutputAreaSizes, _pnIndexArea: number, _pAreaSizes: number[]) {
    let _nDefaultSizeElCur = this._defaultAreaSizes[_pnIndexArea];
    let _nDefaultSizeElPre = this._defaultAreaSizes[_pnIndexArea - 1];

    if (this.direction === 'horizontal') {
      if (isNaN(_nDefaultSizeElCur)) {
        if (_pAreaSizes[_pnIndexArea - 1] === 0) {
          _currentOutputAreaSizes[_pnIndexArea - 1] = this._defaultAreaSizes[_pnIndexArea - 1];
        }
        else {
          _currentOutputAreaSizes[_pnIndexArea - 1] = 0;
        }
      }
      else {
        if (isNaN(_nDefaultSizeElPre)) {
          if (_pAreaSizes[_pnIndexArea] === _nDefaultSizeElCur) {
            _currentOutputAreaSizes[_pnIndexArea] = _pAreaSizes[_pnIndexArea] + _pAreaSizes[_pnIndexArea - 1];
            return;
          }

          if (_pAreaSizes[_pnIndexArea - 1] === 0) {
            _currentOutputAreaSizes[_pnIndexArea] = this._defaultAreaSizes[_pnIndexArea];
            return;
          }

          if (_pAreaSizes[_pnIndexArea] !== 0) {
            _currentOutputAreaSizes[_pnIndexArea] = _pAreaSizes[_pnIndexArea] + _pAreaSizes[_pnIndexArea - 1];
            return;
          }

          if (_pAreaSizes[_pnIndexArea] === 0 && _pAreaSizes[_pnIndexArea - 1] !== 0) {
            _currentOutputAreaSizes[_pnIndexArea] = _pAreaSizes[_pnIndexArea - 1];
            return;
          }
        }
        else {
          if (_pAreaSizes[_pnIndexArea - 1] === 0) {
            _currentOutputAreaSizes[_pnIndexArea] = this._defaultAreaSizes[_pnIndexArea];
            _currentOutputAreaSizes[_pnIndexArea - 1] = this._defaultAreaSizes[_pnIndexArea - 1];
          }
          else {
            _currentOutputAreaSizes[_pnIndexArea - 1] = 0;
            _currentOutputAreaSizes[_pnIndexArea] = _pAreaSizes[_pnIndexArea] + _pAreaSizes[_pnIndexArea - 1];
          }
        }
      }
    }
    // direction = vertical
    else {
      if (isNaN(_nDefaultSizeElCur)) {

        if (_pAreaSizes[_pnIndexArea] === 0) {
          _currentOutputAreaSizes[_pnIndexArea - 1] = this._defaultAreaSizes[_pnIndexArea - 1];
        }
        else {
          _currentOutputAreaSizes[_pnIndexArea - 1] = _pAreaSizes[_pnIndexArea - 1] + _pAreaSizes[_pnIndexArea];
        }
      }
      else {
        if (isNaN(_nDefaultSizeElPre)) {

          if (_pAreaSizes[_pnIndexArea] === _nDefaultSizeElCur) {
            _currentOutputAreaSizes[_pnIndexArea] = 0;
            return;
          }

          if (_pAreaSizes[_pnIndexArea] === 0) {
            _currentOutputAreaSizes[_pnIndexArea] = this._defaultAreaSizes[_pnIndexArea];
            return;
          }

          if (_pAreaSizes[_pnIndexArea] !== 0 && _pAreaSizes[_pnIndexArea - 1] === 0) {
            _currentOutputAreaSizes[_pnIndexArea] = 0;
            return;
          }

          if (_pAreaSizes[_pnIndexArea] !== _nDefaultSizeElCur) {
            _currentOutputAreaSizes[_pnIndexArea] = 0;
            return;
          }
        }
        else {
          if (_pAreaSizes[_pnIndexArea] === 0) {
            _currentOutputAreaSizes[_pnIndexArea] = this._defaultAreaSizes[_pnIndexArea];
            _currentOutputAreaSizes[_pnIndexArea - 1] = this._defaultAreaSizes[_pnIndexArea - 1];
          }
          else {
            _currentOutputAreaSizes[_pnIndexArea] = 0;
            _currentOutputAreaSizes[_pnIndexArea - 1] = _pAreaSizes[_pnIndexArea] + _pAreaSizes[_pnIndexArea - 1];
          }
        }
      }
    }
  }


  public clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void {
    const tempPoint = getPointFromEvent(event);

    // Be sure mouseup/touchend happened at same point as mousedown/touchstart to trigger click/dblclick
    if (this.startPoint && this.startPoint.x === tempPoint.x && this.startPoint.y === tempPoint.y) {
      // If timeout in progress and new click > clearTimeout & dblClickEvent
      if (this._clickTimeout !== null) {
        window.clearTimeout(this._clickTimeout);
        this._clickTimeout = null;
        this.collapsePanel();
        this.notify('dblclick', gutterNum);
        this.stopDragging();
      }
      // Else start timeout to call clickEvent at end
      else {
        this._clickTimeout = window.setTimeout(() => {
          this._clickTimeout = null;
          this.notify('click', gutterNum);
          this.stopDragging();
        }, this.gutterDblClickDuration);
      }
    }
  }

  public startDragging(event: MouseEvent | TouchEvent, gutterOrder: number, gutterNum: number): void {
    event.preventDefault();
    event.stopPropagation();

    //
    this._nGutterOrder = gutterOrder;
    this._nLeftPos = this.elRef.nativeElement.getBoundingClientRect().left;
    this._nTopPos = this.elRef.nativeElement.getBoundingClientRect().top;

    this.startPoint = getPointFromEvent(event);
    if (this.startPoint === null || this.disabled === true) {
      return;
    }

    ////
    if (this._direction === 'horizontal') {
      this._nGutterPos = this.startPoint.x - this._nLeftPos;
    }
    else {
      this._nGutterPos = this.startPoint.y - this._nTopPos;
    }

    this._bIsHidden = false;

    this.snapshot = {
      gutterNum,
      lastSteppedOffset: 0,
      allAreasSizePixel: getElementPixelSize(this.elRef, this.direction) - this.getNbGutters() * this.gutterSize,
      allInvolvedAreasSizePercent: 100,
      areasBeforeGutter: [],
      areasAfterGutter: [],
    };

    this.displayedAreas.forEach(area => {
      const areaSnapshot: IAreaSnapshot = {
        area,
        sizePixelAtStart: getElementPixelSize(area.component.elRef, this.direction),
        sizePercentAtStart: (this.unit === 'percent') ? area.size : -1 // If pixel mode, anyway, will not be used.
      };

      if (area.order < gutterOrder) {
        if (this.restrictMove === true) {
          this.snapshot.areasBeforeGutter = [areaSnapshot];
        }
        else {
          this.snapshot.areasBeforeGutter.unshift(areaSnapshot);
        }
      }
      else if (area.order > gutterOrder) {
        if (this.restrictMove === true) {
          if (this.snapshot.areasAfterGutter.length === 0) this.snapshot.areasAfterGutter = [areaSnapshot];
        }
        else {
          this.snapshot.areasAfterGutter.push(areaSnapshot);
        }
      }
    });

    this.snapshot.allInvolvedAreasSizePercent = [...this.snapshot.areasBeforeGutter, ...this.snapshot.areasAfterGutter].reduce((t, a) => t + a.sizePercentAtStart, 0);

    if (this.snapshot.areasBeforeGutter.length === 0 || this.snapshot.areasAfterGutter.length === 0) {
      return;
    }

    this.dragListeners.push(this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this)));
    this.dragListeners.push(this.renderer.listen('document', 'touchend', this.stopDragging.bind(this)));
    this.dragListeners.push(this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this)));

    this.ngZone.runOutsideAngular(() => {
      this.dragListeners.push(this.renderer.listen('document', 'mousemove', this.dragEvent.bind(this)));
      this.dragListeners.push(this.renderer.listen('document', 'touchmove', this.dragEvent.bind(this)));
    });

    this.displayedAreas.forEach(area => area.component.lockEvents());

    this.isDragging = true;

    this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.addClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');

    this.notify('start', this.snapshot.gutterNum);
  }

  //Date 05/08/19: fix bug block dragging column in flex grid.
  //Add new method setPositionGutter
  @HostListener('mousemove', ['$event'])
  protected setPositionGutter() {
    if (this.endPoint === null) {
      return;
    }

    if (this._direction === 'horizontal') {
      this._nGutterPos = this.endPoint.x - this._nLeftPos;
    }
    else {
      this._nGutterPos = this.endPoint.y - this._nTopPos;
    }
  }

  //QuyenLS listener mouse move when dragging, change position gutter visual
  //Date 05/08/19: fix bug block dragging column in flex grid.
  //Remove @HostListener('mousemove', ['$event'])
  protected dragEvent(event: MouseEvent | TouchEvent): void {
    event.preventDefault();

    if (this._clickTimeout !== null) {
      window.clearTimeout(this._clickTimeout);
      this._clickTimeout = null;
    }

    if (this.isDragging === false) {
      return;
    }

    this.endPoint = getPointFromEvent(event);
    if (this.endPoint === null) {
      return;
    }

    // QuyenLS set position gutter visual
    this.setPositionGutter();

    // Calculate steppedOffset

    let offset = (this.direction === 'horizontal') ? (this.startPoint.x - this.endPoint.x) : (this.startPoint.y - this.endPoint.y);
    if (this.dir === 'rtl') {
      offset = -offset;
    }

    const steppedOffset = Math.round(offset / this.gutterStep) * this.gutterStep;

    if (steppedOffset === this.snapshot.lastSteppedOffset) {
      return;
    }

    this.snapshot.lastSteppedOffset = steppedOffset;

    // Need to know if each gutter side areas could reacts to steppedOffset

    let areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -steppedOffset, this.snapshot.allAreasSizePixel);
    let areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset, this.snapshot.allAreasSizePixel);

    // Each gutter side areas can't absorb all offset 
    if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
      if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) {
      }
      else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
        areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
      }
      else {
        areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
      }
    }
    // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after gutter.
    else if (areasBefore.remain !== 0) {
      areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
    }
    // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before gutter.
    else if (areasAfter.remain !== 0) {
      areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
    }

    if (this.unit === 'percent') {
      // Hack because of browser messing up with sizes using calc(X% - Ypx) -> el.getBoundingClientRect()
      // If not there, playing with gutters makes total going down to 99.99875% then 99.99286%, 99.98986%,..
      const all = [...areasBefore.list, ...areasAfter.list];
      const areaToReset = all.find(a => a.percentAfterAbsorption !== 0 && a.percentAfterAbsorption !== a.areaSnapshot.area.minSize && a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize)

      if (areaToReset) {
        areaToReset.percentAfterAbsorption = this.snapshot.allInvolvedAreasSizePercent - all.filter(a => a !== areaToReset).reduce((total, a) => total + a.percentAfterAbsorption, 0);
      }
    }

    // Now we know areas could absorb steppedOffset, time to really update sizes

    areasBefore.list.forEach(item => updateAreaSize(this.unit, item));
    areasAfter.list.forEach(item => updateAreaSize(this.unit, item));

    // If isRefreshStyleDragging = true then refresh style document when dragging
    if (this._isRefreshStyle) {
      this.refreshStyleSizes();
    }

    this.notify('progress', this.snapshot.gutterNum);
    // }
  }

  protected stopDragging(event?: Event): void {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this._bIsHidden = true;

    // If isRefreshStyleDragging = false then refresh style document after drag.
    if (!this._isRefreshStyle) {
      this.refreshStyleSizes();
    }

    if (this.isDragging === false) {
      return;
    }

    this.displayedAreas.forEach(area => area.component.unlockEvents());

    while (this.dragListeners.length > 0) {
      const fct = this.dragListeners.pop();
      if (fct) fct();
    }

    // Warning: Have to be before "notify('end')" 
    // because "notify('end')"" can be linked to "[size]='x'" > "build()" > "stopDragging()"
    this.isDragging = false;

    // If moved from starting point, notify end
    if (this.endPoint && (this.startPoint.x !== this.endPoint.x || this.startPoint.y !== this.endPoint.y)) {
      this.notify('end', this.snapshot.gutterNum);
    }

    this.renderer.removeClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.removeClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
    this.snapshot = null;

    // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.startPoint = null;
        this.endPoint = null;
      })
    });
  }

  public hideArea(comp: BravoAreaDirective): void {
    const area = this.displayedAreas.find(a => a.component === comp);
    if (area === undefined) {
      return;
    }

    const areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
    areas.forEach(area => {
      area.order = 0;
      area.size = 0;
    })
    this.hidedAreas.push(...areas);

    this.build(true, true);
  }

  public ngOnDestroy(): void {
    this._defaultAreaSizes;
  }
}
