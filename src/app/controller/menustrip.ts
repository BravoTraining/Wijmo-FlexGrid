import { Component, ElementRef, Inject, Injector } from '@angular/core';
import * as wjc from 'wijmo/wijmo';
import { Event, AlignmentEnum } from '../lib/core/core';
import { Observable, Subscription, timer, concat } from 'rxjs';
import { DropDown, Spliter } from './dropdown';
import { IBravoToolStrip } from '../lib/ui/interface/IBravoToolStrip';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';

const AutoNumberingHotKeyFormat = "{0}.";
const DelayTimeWhenSubDropDownOpen = 400;

export class MenuStrip extends wjc.Control {

    hostElement: HTMLElement;
    private _divLeft: HTMLElement;
    private _divRight: HTMLElement;
    private _padding: number = 0;
    protected _bindHandleOnMouseMove = this._handleOnMouseMove.bind(this);
    protected bindHandleOnMouseUp = this._handleOnMouseUp.bind(this);
    private _name: string;
    private _selectedIndex: number;
    private _direction: 'column' | 'column-reverse' | 'row' | 'row-reverse' = 'row';
    public bAutoAddingItemHotKey: boolean = true;
    private _tabIndex: number;
    private _itemsSource: wjc.ObservableArray;

    readonly onAddedItem: wjc.Event = new wjc.Event();
    private _bAutoSize: boolean;

    public get divLeft() {
        if (!this._divLeft)
            this._createDivLeft();

        if (!this.hostElement.contains(this._divLeft))
            this.hostElement.appendChild(this._divLeft);

        return this._divLeft;
    }

    public get divRight() {
        if (!this._divRight)
            this._createDivRight();

        if (!this.hostElement.contains(this._divRight))
            this.hostElement.appendChild(this._divRight);

        return this._divRight;
    }

    public get name() {
        return this._name;
    }

    public set name(val) {
        this._name = val;
    }

    private _bMouseHoverDisable: boolean = false;

    public get bMouseHoverDisable(): boolean {
        return this._bMouseHoverDisable;
    }

    public set bMouseHoverDisable(val: boolean) {
        if (val == this._bMouseHoverDisable) return;
        this._bMouseHoverDisable = val;
    }

    public get visible(): boolean {
        return this.hostElement ? this.hostElement.style.display != 'none' : false;
    }

    public set visible(value: boolean) {
        if (this.hostElement == null) return;
        this.hostElement.style.display = value ? 'flex' : 'none';
    }

    public get padding(): number {
        return this._padding;
    }

    public set padding(val: number) {
        if (val == this._padding) return;
        this._padding = val;
        let _arr = [];

        this.itemsSource.forEach((_item) => {
            _arr.push(this._getHTMLElementOfItem(_item));
        });

        wjc.setCss(_arr, {
            marginLeft: this.padding + 'px',
            marginRight: this.padding + 'px',
        });
    }

    public get bAutoSize(): boolean {
        return this._bAutoSize;
    }

    public set bAutoSize(val) {
        this._bAutoSize = val;
        if (this._bAutoSize) {
            wjc.setCss(this.hostElement, {
                flex: '0 0 auto'
            });
        } else {
            wjc.setCss(this.hostElement, {
                flex: '1 1 100%'
            });
        }
    }

    public get isDroppedDown(): boolean {
        return this.itemsSource.some((_item) => {
            if (_item instanceof DropDown) {
                return _item.isDroppedDown;
            } else {
                return false;
            }
        });
    }

    public hideDropDown() {
        this.itemsSource.forEach((_item) => {
            if (_item instanceof DropDown) {
                _item.hide();
            }
        });
    }

    public static addHotKeyPrefix(pnHotKeyNumberingValue: number) {
        let _zHotKey: string = null;

        if (pnHotKeyNumberingValue < 10) {
            _zHotKey = `${pnHotKeyNumberingValue}`;
        }
        else {
            _zHotKey = String.fromCharCode(pnHotKeyNumberingValue - 10 + 97);

            if (_zHotKey.length > 1)
                return null;
        }

        return String.format(AutoNumberingHotKeyFormat, _zHotKey);
    }

    public get direction(): 'column' | 'column-reverse' | 'row' | 'row-reverse' {
        return this._direction;
    }

    public set direction(value: 'column' | 'column-reverse' | 'row' | 'row-reverse') {
        if (this._direction == value) return;
        this._direction = value;

        this.hostElement.style.flexDirection = value;
    }

    public get itemsSource() {
        return this._itemsSource;
    }

    _cv: wjc.ICollectionView;
    public set itemsSource(value: wjc.ObservableArray) {
        if (this._itemsSource != value) {

            // unbind current collection view
            if (this._cv) {
                this._cv.currentChanged.removeHandler(this._cvCurrentChanged.bind(this));
                this._itemsSource.collectionChanged.removeHandler(this._cvCollectionChanged.bind(this));
                this._cv = null;
            }

            // save new data source and collection view
            this._itemsSource = value;
            this._cv = wjc.asCollectionView(value);
            // bind new collection view
            if (this._cv != null) {
                this._cv.currentChanged.addHandler(this._cvCurrentChanged.bind(this));
                this._itemsSource.collectionChanged.addHandler(this._cvCollectionChanged.bind(this));
            }

            // update the list
            this.onSelectedIndexChanged();
        }
    }

    get selectedIndex(): number {
        return this._cv ? this._cv.currentPosition : -1;
    }

    set selectedIndex(value: number) {
        if (this._cv)
            this._cv.moveCurrentToPosition(wjc.asNumber(value));
    }

    get selectedItem(): any {
        return this._cv ? this._cv.currentItem : null;
    }

    set selectedItem(value: any) {
        if (this._cv)
            this._cv.moveCurrentTo(value);
    }

    showSelection() {
        let index = this.selectedIndex,
            host = this.hostElement,
            children = this.itemsSource,
            e: HTMLElement;

        // highlight
        for (let i = 0; i < children.length; i++) {
            e = this._getHTMLElementOfItem(children[i]) as HTMLElement;
            wjc.toggleClass(e, 'wj-state-selected', i == index);
            wjc.toggleClass(e, 'wj-state-dropped', false);
            wjc.setAttribute(e, 'tabindex', i == index ? this._tabIndex : -1);
        }

        // scroll into view
        if (index > -1 && index < children.length) {
            e = this._getHTMLElementOfItem(children[index]) as HTMLElement;
            let rco = e.getBoundingClientRect(),
                rcc = host.getBoundingClientRect();

            if (rco.bottom > rcc.bottom)
                host.scrollTop += rco.bottom - rcc.bottom;
            else if (rco.top < rcc.top)
                host.scrollTop -= rcc.top - rco.top;
        }

        // make sure the focus is within the selected element (TFS 135278)
        if (index > -1 && this.containsFocus()) {
            e = this._getHTMLElementOfItem(children[index]) as HTMLElement;
            if (e instanceof HTMLElement && !wjc.contains(e, wjc.getActiveElement())) {
                e.focus();
            }
        }

        // update control's tabindex as well
        wjc.setAttribute(host, 'tabindex', index < 0 ? this._tabIndex : -1);
    }

    constructor(hostElement: HTMLElement) {
        super(hostElement);
        this._tabIndex = this.hostElement.tabIndex;
        this.itemsSource = new wjc.ObservableArray();
        this._addListenr();
        this._createDivLeft();
        this._createDivRight();
        this.hostElement.appendChild(this._divLeft);
        this.hostElement.appendChild(this._divRight);

        this.hostElement.classList.add('bravo-menu-strip');
    }

    private _cvCollectionChanged(s: any, e: wjc.NotifyCollectionChangedEventArgs) {
        if (this.isUpdating) return;

        if (e instanceof wjc.NotifyCollectionChangedEventArgs) {
            let _element: HTMLElement = this._getHTMLElementOfItem(e.item);

            if (e.action == wjc.NotifyCollectionChangedAction.Add) {
                let _index = Math.min(e.index, this.itemsSource.length);
                if (_index < this.itemsSource.length - 1) {
                    this._reIndex(_index);
                }
                this._populateElement(e.item, _index);
            }
            else if (e.action == wjc.NotifyCollectionChangedAction.Remove) {
                if (_element) {
                    if (e.item instanceof wjc.Control)
                        e.item.dispose();
                    else
                        _element.remove();
                }
            }
            else if (e.action == wjc.NotifyCollectionChangedAction.Reset) {
                if (this.itemsSource.length <= 0)
                    this.clear();
                else
                    this.refresh();
            }
        }
    }

    private _reIndex(pnindex: number) {
        for (let _n = pnindex + 1; _n < this.itemsSource.length; _n++) {
            let _element = this._getHTMLElementOfItem(this.itemsSource[_n]);
            if (_element) _element.setAttribute('bravo-menustrip-index', _n.toString());
        }
    }

    private _cvCurrentChanged(sender: any, e: wjc.EventArgs) {
        this.showSelection();
        this.onSelectedIndexChanged();
    }

    readonly selectedIndexChanged = new Event();
    onSelectedIndexChanged(e?: wjc.EventArgs) {
        this.selectedIndexChanged.raise(this, e);
    }

    containsFocus(): boolean {
        let host = this.hostElement,
            ae = wjc.getActiveElement();

        // test for disposed controls
        if (!host) {
            return false;
        }

        // travel up the tree...
        for (let e = ae; e;) {
            if (e == host) {
                return true;
            }
            e = e[wjc.Control._OWNR_KEY] || e.parentElement;
        }

        return this._itemsSource.some((value) => {
            if (value instanceof wjc.Control) {
                if (value.containsFocus()) {
                    return true;
                }
            }
        })
        // no deal...
        // return false 
    }

    private _addListenr() {
        document.addEventListener('mouseup', this.bindHandleOnMouseUp, false);
        this.hostElement.addEventListener('mousemove', this._bindHandleOnMouseMove, false);
        this.hostElement.addEventListener('mouseleave', this._bindHandleOnMouseMove, false)
    }

    private _removeListener() {
        document.removeEventListener('mouseup', this.bindHandleOnMouseUp, false);
        if (this.hostElement) {
            this.hostElement.removeEventListener('mousemove', this._bindHandleOnMouseMove, false);
            this.hostElement.removeEventListener('mouseleave', this._bindHandleOnMouseMove, false);
        }
        if (this.itemsSource)
            this.itemsSource.collectionChanged.removeAllHandlers();
        if (this._cv)
            this._cv.currentChanged.removeAllHandlers();
    }

    private _createDivLeft() {
        this._divLeft = document.createElement('div');
        wjc.setCss(this._divLeft, {
            flex: '0 0 auto',
            display: 'flex',
            height: '100%'
        });
    }

    private _createDivRight() {
        this._divRight = document.createElement('div');
        this.hostElement.appendChild(this._divRight);
        wjc.setCss(this._divRight, {
            flex: '1 1 100%',
            display: 'flex',
            flexDirection: 'row-reverse',
            height: '100%'
        });
    }

    public getControl(name) {
        return this.itemsSource.find(ctrl => {
            let _c = wjc.tryCast(ctrl, 'IBravoToolStrip') as IBravoToolStrip;
            if (_c) {
                return _c.name == name;
            } else if (ctrl instanceof wjc.Control) {
                return ctrl.hostElement.id == name;
            } else if (ctrl instanceof HTMLElement) {
                return ctrl.id == name;
            }
        });
    }

    private _getHTMLElementOfItem(ref) {
        let _item: HTMLElement;

        let _ctrl: wjc.Control = ref instanceof wjc.Control ? ref : null;
        let _html: HTMLElement = _ctrl == null && ref instanceof HTMLElement ? ref : null;

        if (_ctrl != null)
            _item = _ctrl.hostElement;
        else if (_html != null)
            _item = _html;

        return _item;
    }

    private _getIndexAfter(pnIndex: number, pAlignment: AlignmentEnum) {
        let _divContainer = pAlignment == AlignmentEnum.Right ? this._divRight : this._divLeft;
        if (_divContainer) {
            for (let _n = 0; _n < _divContainer.children.length; _n++) {
                let _element = _divContainer.children.item(_n);
                if (_element) {
                    let _pos = Number(_element.getAttribute('bravo-menustrip-index'));
                    if (_pos >= pnIndex) {
                        return _pos
                    }
                }
            }
            return _divContainer.children.length;
        }
        return 0;
    }

    public containControl(name: string): boolean {
        return this.getControl(name) != undefined;
    }

    public removeControl(name: string) {
        let _index = this.itemsSource.findIndex(ctrl => {
            if (ctrl instanceof DropDown) {
                return ctrl.name == name;
            } else if (ctrl instanceof wjc.Control) {
                return ctrl.hostElement.id == name;
            } else if (ctrl instanceof HTMLElement) {
                return ctrl.id == name;
            }
        });
        if (_index != -1) this.itemsSource.removeAt(_index);
    }

    private _populateElement(pItem: any, pnIndex = this.itemsSource.length) {
        if (this.hostElement == null) return;

        let _element: HTMLElement = this._getHTMLElementOfItem(pItem);
        if (!this.divLeft.contains(_element) && !this.divRight.contains(_element)) {
            if (_element instanceof HTMLHRElement) {
                let _indexAfter = this._getIndexAfter(pnIndex, pItem.alignment);
                if (pItem.alignment == AlignmentEnum.Right) {
                    this._divRight.insertBefore(_element, this._divRight.children[_indexAfter]);
                }
                else {
                    this._divLeft.insertBefore(_element, this._divLeft.children[_indexAfter]);
                }

            }
            else if (_element) {
                _element.classList.add('bravo-menustrip-item');
                _element.setAttribute('bravo-menustrip-index', pnIndex.toString());

                wjc.setCss(_element, {
                    marginLeft: this.padding + 'px',
                    marginRight: this.padding + 'px',
                });

                let _indexAfter = this._getIndexAfter(pnIndex, pItem.alignment);

                if (pItem.alignment == AlignmentEnum.Right) {
                    this._divRight.insertBefore(_element, this._divRight.children[_indexAfter]);
                }
                else {
                    this._divLeft.insertBefore(_element, this._divLeft.children[_indexAfter]);
                }

            }
        }
    }

    public setAlignment(pItem: any, pAlignment: AlignmentEnum) {

        let _element = this._getHTMLElementOfItem(pItem);
        let _indexElement = this._getIndexOfElement(_element);
        let _indexAfter = this._getIndexAfter(_indexElement, pAlignment);
        if (pAlignment == AlignmentEnum.Right) {
            this._divRight.insertBefore(_element, this._divRight.children[_indexAfter]);
        } else if (pAlignment == AlignmentEnum.Left) {
            this._divLeft.insertBefore(_element, this._divLeft.children[_indexAfter]);
        }
    }

    _subscriptionShow: Subscription;
    protected _handleOnMouseMove(e: MouseEvent) {
        if (this.bMouseHoverDisable) return;

        if (e.buttons > 0) return;

        if (e.type == 'mouseleave') {
            if (this._subscriptionShow) {
                this._subscriptionShow.unsubscribe();
                this._subscriptionShow = null;
            }
            if (this.selectedItem instanceof DropDown) {
                if (!this.selectedItem.isDroppedDown) {
                    this.selectedIndex = -1;
                }
            } else {
                this.selectedIndex = -1;
            }

        }
        else {
            let _element = (<HTMLElement>e.target).closest('.bravo-menustrip-item');
            if (_element) {
                let _index = Number(_element.getAttribute('bravo-menustrip-index'));
                if (_index == this.selectedIndex) {
                    return;
                }

                if (this.selectedItem instanceof DropDown) {
                    this.selectedItem.hide();
                }
                if (this._subscriptionShow) {
                    this._subscriptionShow.unsubscribe();
                    this._subscriptionShow = null;
                }
                if (this.selectedItem instanceof DropDown) {
                    if (!this.selectedItem.isDroppedDown) {
                        this.selectedIndex = -1;
                    }
                }
                this.selectedIndex = _index;
                if (this.selectedItem instanceof DropDown && !this.selectedItem.bMouseHoverDisable) {
                    this._subscriptionShow = this._asyncChangeSelect(this.selectedIndex).subscribe((v) => {
                    });
                }
            } else {
                if (this.selectedItem instanceof DropDown) {
                    if (!this.selectedItem.isDroppedDown) {
                        this.selectedIndex = -1;
                    }
                }
                return;
            }
        }
    }

    protected _handleOnMouseUp(e: MouseEvent) {
        if (this.selectedItem)
            if (this.selectedItem instanceof wjc.Control && wjc.contains(this.selectedItem.hostElement, wjc.getActiveElement())) {
                return;
            }

        setTimeout(() => {
            this.selectedIndex = -1;
        }, 100);
    }

    dispose() {
        this._removeListener();
        this.clear();
        super.dispose();
    }

    clear() {
        if (this.itemsSource.length > 0) {
            this.itemsSource.forEach(_item => {
                if (_item instanceof wjc.Control) {
                    _item.dispose();
                } else if (_item instanceof HTMLElement) {
                    _item.remove();
                }
            });

            this.itemsSource.clear();
        }

        while (this._divLeft.firstChild) {
            this._divLeft.removeChild(this._divLeft.firstChild);
        }
        while (this._divRight.firstChild) {
            this._divRight.removeChild(this._divRight.firstChild);
        }
    }

    protected _asyncChangeSelect(pnSelectedIndex: number, pnTime?: number): Observable<any> {
        let _observer = new Observable(observer => {
            if (this.selectedItem instanceof DropDown) {
                let _host = this.selectedItem.hostElement;
                wjc.toggleClass(_host, 'wj-state-selected');
                wjc.toggleClass(_host, 'wj-state-dropped');
                let _evt = new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                this.selectedItem._btnclick(_evt);
            }
            observer.next({ "state": 2, "index": pnSelectedIndex });
            observer.complete();
        });
        return concat(timer(pnTime ? pnTime : DelayTimeWhenSubDropDownOpen), _observer);
    }

    private _getIndexOfElement(pElement: HTMLElement) {
        for (let _n = 0; _n < this.hostElement.children.length; _n++) {
            if (this.hostElement.children[_n] == pElement) {
                return _n;
            }
        }
        return -1;
    }

    refresh(fullUpdate = true) {
        super.refresh(fullUpdate);
        this._itemsSource.forEach((_item, _index) => {
            this._populateElement(_item, _index);
            if (_item instanceof wjc.Control && _item.hostElement) {
                _item.refresh();
            }
        })
    }

    addToolStripSpliter(position: number = -1) {
        if (position == -1)
            this.itemsSource.push(new CustomSpliter());
        else
            this.itemsSource.insert(position, new CustomSpliter());
    }
}

class CustomSpliter extends Spliter {
    created() {
        wjc.addClass(this.hostElement, 'spliter');
    }
}