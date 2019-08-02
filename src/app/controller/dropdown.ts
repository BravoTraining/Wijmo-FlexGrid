import { Image, Event, EventArgs, ExtensionsMethod, AlignmentEnum, DisplayStyleEnum } from '../lib/core/core';
import * as wjc from 'wijmo/wijmo';
import * as wji from 'wijmo/wijmo.input';
import { BravoSettings } from '../lib/ui/bravo.settings';
import { Observable, Subscription, timer, concat } from 'rxjs';

import { Font } from '../lib/ui/font';
import { BravoGraphicsRenderer } from '../lib/ui/bravo.graphics.renderer';
import { IBravoToolStrip } from '../lib/ui/interface/IBravoToolStrip';
import { PropertyChangedEventArgs } from '../lib/ui/eventArgs/propertyChanged.eventargs';
import { MergeAction } from '../lib/ui/enums';

const DisplayMemberPath = 'zDisplayMember';
const SubItemsPath = 'childMenuItems';
export const CheckmarkIconPath = 'web-check';
const MessageTypeIsAccepted = 'HTMLElement or Control is accepted.';
export const DelayTimeWhenSubDropDownOpen = 350;

export class DropDown extends wji.Menu {
    protected _bindHandleOnBlurPopup = this._handleOnBlurPopUp.bind(this);
    protected _bindHandleOnMouseMove = this._handleOnMouseMove.bind(this);
    protected _bindHandleOnMouseEnter;
    protected _bindHandleOnKeyPress = this._handleOnKeyPress.bind(this);
    protected _bindHandleOnClick = this._btnclick.bind(this);
    protected _bindHandleOnBtnMouseDown = this._btnclick.bind(this);

    protected _itemsSource: wjc.ObservableArray;
    public _subBravoDropDown: DropDown;
    public _ownerElement: HTMLElement;
    public _parentBravoDropDown: DropDown;

    private _bBelongsToDropDown: boolean = false;

    public get bBelongsToDropDown(): boolean {
        return this._bBelongsToDropDown;
    }
    public set bBelongsToDropDown(value: boolean) {
        this._bBelongsToDropDown = value;
    }

    private _parentIndex: number;

    protected _name: string;
    protected _tag: any;

    protected _bMouseHoverDisable: boolean = false;
    public readonly propertyChanged = new Event();

    public get name() {
        return this._name;
    }

    public set name(val: string) {
        this._name = val;
    }

    public get tag() {
        return this._tag;
    }

    public set tag(val: any) {
        this._tag = val;
    }

    protected _image: Image = new Image('', 'png', null, 16);

    public get image(): Image {
        return this._image;
    }
    public set image(value: Image) {
        if (this._image != value) {
            this._image = value;
            this._isChanged = true;
            if (this.propertyChanged)
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('image', this._image));
            this.invalidate(true);
        }
    }
    protected _displayStyle: DisplayStyleEnum;

    public get displayStyle() {
        if (!this._displayStyle)
            this._displayStyle = DisplayStyleEnum.ImageAndText;
        return this._displayStyle;
    }

    public set displayStyle(val: any) {
        if (wjc.isString(val)) {
            val = <any>DisplayStyleEnum[val];
        }
        if (this._displayStyle != val) {
            this._displayStyle = val || DisplayStyleEnum.ImageAndText;
            this.invalidate(true);
        }
    }

    protected _alignment: AlignmentEnum = AlignmentEnum.Left;

    public get alignment(): any {
        return this._alignment;
    }
    public set alignment(value: any) {
        if (wjc.isString(value)) {
            this._alignment = <any>AlignmentEnum[value];
        } else {
            this._alignment = value;
        }
    }

    protected _isChanged: boolean = false;

    public get isChanged(): boolean {
        return this._isChanged;
    }
    public set isChanged(value: boolean) {
        this._isChanged = value;
    }

    protected _visible: boolean = true;

    public get visible(): boolean {
        return this._visible;
    }
    public set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;
            this._isChanged = true;
            if (this.propertyChanged)
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('visible', this._visible));

            this.invalidate(true);
        }
    }

    protected _enabled: boolean = true

    public get enabled(): boolean {
        return this._enabled;
    }

    public set enabled(value: boolean) {
        if (this._enabled != value) {
            this._enabled = value;
            this._isChanged = true;
            if (this.propertyChanged)
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('enabled', this._enabled));
            this.invalidate(true);
        }
    }

    protected _text: string = '';

    public get text() {
        return this._text;
    }

    public set text(val) {
        this._text = val;
        if (this._text != val) {
            this._text = val;
            this._isChanged = true;
            if (this.propertyChanged)
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('text', this._text));
            this.invalidate();
        }
    }

    public get itemsSource(): any {
        return this._lbx.itemsSource;
    }

    public set itemsSource(pItems: any) {
        if (this._itemsSource && this._itemsSource.length > 0) {
            this._itemsSource.forEach((_item, _i) => {
                if (_item.propertyChanged)
                    _item.propertyChanged.removeAllHandlers();
            });
        }

        if (pItems instanceof wjc.ObservableArray) {
            this._itemsSource = pItems;
        }
        else {
            this._itemsSource = new wjc.ObservableArray(...pItems);
        }

        if (this._lbx.itemsSource != this._itemsSource) {
            this._lbx.itemsSource = this._itemsSource;
            this.onItemsSourceChanged();
        }

        this._updateBtn();

        this._intialItemSource();
        this._renderDropdownWidth();
    }

    public getMenuItem(pzItemName: string, pzGroupName?: string) {
        if (pzGroupName) {
            let _item = this.itemsSource.find(_i => _i.name == pzGroupName);
            return _item.childMenuItems.find(_i => _i.name == pzItemName);
        } else {
            return this.itemsSource.find(_item => _item.name == pzItemName);
        }
    }

    public get bMouseHoverDisable(): boolean {
        return this._bMouseHoverDisable;
    }

    public set bMouseHoverDisable(val: boolean) {
        this._bMouseHoverDisable = val;
        if (this._subBravoDropDown) {
            this._subBravoDropDown.bMouseHoverDisable = this._bMouseHoverDisable;
        }
    }

    public bAllowAppendLeft: boolean = true;

    public readonly itemSelected = new Event();
    public readonly onLoad = new Event();

    public constructor(hostElement: HTMLElement, ...pItems: Array<any>) {
        super(hostElement);
        this._ownerElement = hostElement
        this.itemsSource = pItems;
        this._initialControl();
        this._addListener();
        this._renderDropdownWidth();

    }

    protected _initialControl() {
        this.displayMemberPath = DisplayMemberPath;
        this.isContentHtml = false;
        this.dropDown.classList.add('bravo-menu');
        this.listBox.removeEventListener(this.listBox.hostElement, 'keypress');
        this.listBox.lostFocus.removeAllHandlers();
        this.removeEventListener(this._hdr, 'click');
        this.dropDownCssClass = '';
        this._autoExpand = false;

        this.dropDown.style.fontFamily = BravoSettings.current.zDefaultFontName;
        this.dropDown.style.fontSize = BravoSettings.current.nFontSize.toString() + 'pt';
    }

    containsFocus(): boolean {
        return super.containsFocus() || this.isDroppedDown;
    }

    onIsDroppedDownChanged() {
        super.onIsDroppedDownChanged();
        if (this.isDroppedDown) {
            if (!this._bEnableRenderDropdownWidth) {
                this._bEnableRenderDropdownWidth = true
            }
            this._renderDropdownWidth();
        }
    }

    protected _keydown(e: KeyboardEvent) {
        this._altDown = e.altKey;
        // ignore if default prevented
        if (e.defaultPrevented) return;
        // handle key
        switch (e.keyCode) {
            // close dropdown on tab, escape, enter
            case wjc.Key.Escape:
                if (this.isDroppedDown) {
                    this.hide(6);
                    this._moveFocusToParent();
                    e.preventDefault();
                }
                break;
            case wjc.Key.Enter:
                let _evt = new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                this._dropDownClick(_evt);
                break;
            case wjc.Key.Right:
                this._showSubBravoMenuItem(this.selectedIndex);
                break;

            case wjc.Key.Left:
                if (this._ownerElement != this.hostElement) {
                    this.hide(8);
                    this._moveFocusToParent();
                }

                break;

            default: super._keydown(e);
                break;
        }
    }

    protected _addListener() {
        this.dropDown.addEventListener('keypress', this._bindHandleOnKeyPress, false);
        this._hdr.addEventListener('click', this._bindHandleOnClick);
        this._btn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        this.isDroppedDownChanged.addHandler(() => {
            if (this.isDroppedDown) {
                document.addEventListener('mousedown', this._bindHandleOnBlurPopup);
            }
            else {
                document.removeEventListener('mousedown', this._bindHandleOnBlurPopup);
            }
        });

        this.formatItem.addHandler(this._handleOnFormatItem.bind(this));
    }

    protected _removeListener() {
        if (this.dropDown) {
            for (let _n = 0; _n < this.dropDown.children.length; _n++) {
                this.dropDown.children.item(_n).removeEventListener('mousemove', this._bindHandleOnMouseMove, false);
            }
        }
        document.removeEventListener('mousedown', this._bindHandleOnBlurPopup);
        this._hdr.removeEventListener('click', this._bindHandleOnClick);
        this._btn.removeEventListener('mousedown', this._bindHandleOnBtnMouseDown);

        if (this._itemsSource && this._itemsSource.length > 0) {
            for (let _i = this._itemsSource.length - 1; _i >= 0; _i--) {
                let _item = wjc.tryCast(this._itemsSource[_i], 'IBravoToolStrip');
                if (_item != null && _item.propertyChanged)
                    _item.propertyChanged.removeAllHandlers();
            }
        }

        if (this.dropDown)
            this.dropDown.removeEventListener('keypress', this._bindHandleOnKeyPress, false);
        if (this.isDroppedDownChanged)
            this.isDroppedDownChanged.removeAllHandlers();
        if (this.collectionView)
            this.collectionView.collectionChanged.removeAllHandlers();
        if (this.formatItem)
            this.formatItem.removeAllHandlers();
        if (this.itemSelected)
            this.itemSelected.removeAllHandlers();
        if (this.onLoad)
            this.onLoad.removeAllHandlers();
    }

    protected _intialItemSource() {
        this.selectedIndex = -1;
        refreshPropertyItemsState(this._itemsSource);

        this._itemsSource.collectionChanged.addHandler((s, e: wjc.NotifyCollectionChangedEventArgs) => {
            let _item = wjc.tryCast(e.item, 'IBravoToolStrip') as IBravoToolStrip;

            if (_item) {
                _item.bBelongsToDropDown = true;
            }
            if (e.action == wjc.NotifyCollectionChangedAction.Add && e.item.propertyChanged) {
                e.item.propertyChanged.removeAllHandlers();
                e.item.propertyChanged.addHandler(this._handlePropertyChanged.bind(this));
            }
            else if (e.action == wjc.NotifyCollectionChangedAction.Reset) {
                this._itemsSource.forEach(item => {
                    let _item = wjc.tryCast(item, 'IBravoToolStrip') as IBravoToolStrip;

                    if (_item && _item.bBelongsToDropDown == false) {
                        _item.bBelongsToDropDown = true;
                    }
                });
            }
        }
        );
    }

    private _handlePropertyChanged(s, e: PropertyChangedEventArgs) {
        if (s.isChanged && this.isDroppedDown && !this.isUpdating && s.bBelongsToDropDown) {
            this._renderDropdownWidth();

            let _n = this.itemsSource.indexOf(s);
            let _data = s;
            let _element = <HTMLElement>this.dropDown.children[_n];
            this._handleOnFormatItem(this.listBox, new wji.FormatItemEventArgs(_n, _data, _element));

            refreshPropertyItemsState(this._itemsSource);
        }
    }

    protected _bEnableRenderDropdownWidth = false;

    protected _renderDropdownWidth(pbSetWidth = true) {
        if (!this.itemsSource || this.itemsSource.length < 0 || !this.dropDown || !this._bEnableRenderDropdownWidth) return -1;

        let _style = getComputedStyle(this.dropDown);
        let _widthNew = 0;

        if (!this.isContentHtml) {
            let _array = this.itemsSource.clone();

            let _longestText = _array.sort((a, b) => {
                if (!a.text) a.text = '';
                if (!b.text) b.text = '';
                return a.text.length <= b.text.length ? 1 : -1;
            })[0].text;

            let _zFontName = _style.fontFamily ? _style.fontFamily : BravoSettings.current.zDefaultFontName;
            let _nFontSize = _style.fontSize ? _style.fontSize : BravoSettings.current.nFontSize;
            let _textMetric = BravoGraphicsRenderer.measureString(_longestText, new Font(_zFontName, _nFontSize));

            _widthNew = _textMetric.width;
        }
        else {
            let _item = <HTMLElement>this.dropDown.children.item(0);
            _widthNew = _item.offsetWidth;
        }

        // add image width
        let _divLeft = this.dropDown.querySelector('.wj-left');
        if (_divLeft) {
            _style = getComputedStyle(_divLeft);
            _widthNew += Number(_style.width.replace('px', ''));
            _widthNew += Number(_style.marginLeft.replace('px', ''));
            _widthNew += Number(_style.marginRight.replace('px', ''));
        }
        // add padding width
        let _btn = this.dropDown.querySelector('.wj-subitems');
        if (_btn) {
            _style = getComputedStyle(_btn);
            _widthNew += Number(_style.paddingLeft.replace('px', ''));
            _widthNew += Number(_style.paddingRight.replace('px', ''));
        } else {
            let _element = this.dropDown.querySelector('.wj-menuitem')
            if (_element) {
                _style = getComputedStyle(_element);
                _widthNew += Number(_style.paddingLeft.replace('px', ''));
                _widthNew += Number(_style.paddingRight.replace('px', ''));
            }
        }
        //add scrollbar width
        _widthNew += this._getScrollbarWidth();
        _widthNew += 5;

        if (pbSetWidth) {
            wjc.setCss(this.dropDown, {
                minWidth: _widthNew.toString() + 'px'
            })
        }
        return _widthNew;
    }

    _btnclick(e) {
        if (!this.isDroppedDown) {
            if (this._onLoadComplete()) {
                this.show(this.hostElement);
                this.dropDown.focus();
            }
        }
        else {
            this.hide(1);
        }
        e.stopPropagation();
    }

    hide(where?: number) {
        if (where) {

        }
        if (this._subBravoDropDown && this._subBravoDropDown.isDroppedDown) {
            this._subBravoDropDown.hide(9);
        }

        if (this._subscriptionShow) {
            this._subscriptionShow.unsubscribe();
            this._subscriptionShow = null;
        }
        super.hide();
    }

    public _onLoadComplete(): boolean {
        let _cancleEventArgs = new wjc.CancelEventArgs();

        if (this.isDroppedDown) {
            if (this._subscriptionHide) {
                this._subscriptionHide.unsubscribe();
                this._subscriptionHide = null;
            }
            this.hide(2);
        }

        if (this.onLoad.hasHandlers) {
            this.onLoad.raise(this, _cancleEventArgs);
        }
        if (!_cancleEventArgs.cancel) {

            this._itemsSource.forEach((_item, _i) => {
                if (_item.propertyChanged && !_item.propertyChanged.hasHandlers) {
                    _item.propertyChanged.addHandler(this._handlePropertyChanged.bind(this));
                }
            });
            if (isPropertyItemsChanged(this._itemsSource)) {
                this._renderDropdownWidth();
                this._lbx._cv.collectionChanged.raise(this._lbx);
                refreshPropertyItemsState(this._itemsSource);
            }
        }

        return !_cancleEventArgs.cancel;
    }

    protected _showSubBravoMenuItem(pnSelectedIndex: number) {
        if (this.selectedIndex != pnSelectedIndex) return;
        if (!this.isDroppedDown) return;

        let _item = this._itemsSource[pnSelectedIndex];
        if (_item instanceof DropDown) {
            let _array = _item.itemsSource;

            if (this._subBravoDropDown && this._subBravoDropDown != _item) {
                this._subBravoDropDown.itemSelected.removeAllHandlers();
                this._subBravoDropDown.hide(11);
            }
            if (this._subBravoDropDown != _item) {
                this._subBravoDropDown = _item;
                this._subBravoDropDown._dropDown.id = wjc.getUniqueId('_dropdown');
                this._subBravoDropDown.itemSelected.addHandler(this._handleSubMenuItemClicked.bind(this));
                this._subBravoDropDown._ownerElement = this.dropDown;
                this._subBravoDropDown._parentBravoDropDown = this;

                this._subBravoDropDown.bMouseHoverDisable = this.bMouseHoverDisable;
            }


            this._subBravoDropDown._parentIndex = pnSelectedIndex;

            let _childEle = this.listBox._getChild(pnSelectedIndex);
            let rc = _childEle.getBoundingClientRect();

            let _parentRect = this.dropDown.getBoundingClientRect();
            let _x = _parentRect.left + _parentRect.width + BravoSettings.toCurrentDpiXWithBorder(.5);
            let _y = rc.top;

            let _popupWith = Number(this._subBravoDropDown.dropDown.style.width.replace('px', ''));

            if (_x + _popupWith > document.documentElement.clientWidth - 20) {
                _x = _parentRect.left - _popupWith - BravoSettings.toCurrentDpiXWithBorder(.5);
            }

            if (!this._subBravoDropDown.isDroppedDown) {
                if (document.contains(this._subBravoDropDown._ownerElement)) {
                    this._subBravoDropDown.show(new wjc.Point(_x, _y));
                }
            }
        }
    }

    protected _asyncChangeSelect(pnSelectedIndex: number, pnTime?: number): Observable<any> {
        let _observer = new Observable(observer => {
            let _item = this.itemsSource[pnSelectedIndex];
            if (this._subBravoDropDown)
                this._subBravoDropDown.selectedIndex = -1;
            if (_item instanceof DropDown) {
                this._showSubBravoMenuItem(pnSelectedIndex);
                observer.next({ "state": 2, "index": pnSelectedIndex });
            } else {
                if (this._subBravoDropDown && this._subBravoDropDown.isDroppedDown) {
                    this._subBravoDropDown.hide(12);
                    observer.next({ "state": 1, "index": pnSelectedIndex });
                }
            }
            observer.complete();
        });
        return concat(timer(pnTime ? pnTime : DelayTimeWhenSubDropDownOpen), _observer);
    }

    public onItemClicked() {
        if (this.selectedItem && this.selectedItem instanceof DropDown) {
            this._showSubBravoMenuItem(this.selectedIndex);
        } else if (this.selectedItem && !(this.selectedItem instanceof Spliter)) {
            let _item = this.selectedItem;
            this.onMenuItemSelected(this, this, new ItemDropDownEventArgs(_item, _item.name));
            if (this.onIsDroppedDownChanging(new wjc.CancelEventArgs())) {

                this._getTopParent().hide(5);
            }
        }
    }

    protected onMenuItemSelected(owner: DropDown, sender: DropDown, e: ItemDropDownEventArgs) {
        if (owner == sender) {
            let _itemOwner = owner.selectedItem;
            if (_itemOwner && _itemOwner.clickedFunction && wjc.isFunction(_itemOwner.clickedFunction)) {
                _itemOwner.clickedFunction(owner);
                return;
            }
            if (this.itemSelected.hasHandlers) {
                this.itemSelected.raise(sender, e);
            }
        } else {
            if (!e.zGroupName) {
                let _itemOwner = owner.selectedItem;
                if (this.itemSelected.hasHandlers) {
                    this.itemSelected.raise(owner, new ItemDropDownEventArgs(e.item, e.zItemName, _itemOwner.name, this));
                }
            } else {
                if (this.itemSelected.hasHandlers) {
                    this.itemSelected.raise(owner, e);
                }
            }
        }
    }

    refresh(fullUpdate = true) {
        if (this.hostElement == null)
            return;

        super.refresh(fullUpdate);
        this._lbx._cv.collectionChanged.raise(this._lbx);
        if (!this._bBelongsToDropDown) {
            this._updateHeader(this.text, this.displayStyle, this.image);

            if (!this.visible) {
                this.hostElement.classList.add('wj-state-disabled', 'wj-state-hidden');
            } else if (!this.enabled) {
                this.hostElement.classList.add('wj-state-disabled');
            }

            if (this.enabled) {
                this.hostElement.classList.remove('wj-state-disabled');
            }

            if (this.visible) {
                this.hostElement.classList.remove('wj-state-hidden');
            }
        }
        if (this._itemsSource.length > 0 && this.dropDown.children.length == this._itemsSource.length) {
            this._itemsSource.forEach((val) => {
                let _item = wjc.tryCast(val, 'IBravoToolStrip') as IBravoToolStrip;
                if (_item && _item.isChanged == true && !_item.bBelongsToDropDown) {
                    _item.refresh();
                    _item.isChanged = false;
                }
            });
            // refreshPropertyItemsState(this._itemsSource);
        }
    }

    protected _updateHeader(pzText: string, pDisplayStyle: DisplayStyleEnum, pImage?: Image) {
        if (!pImage || (pImage && (!pImage.src && !pImage.base64))) {
            this._displayStyle = DisplayStyleEnum.Text;
        } else {
            this._displayStyle = pDisplayStyle;
            this._image = pImage;
        }

        this._text = pzText || '';

        if (this._displayStyle == DisplayStyleEnum.Image) {
            if (this._image) {
                let _image = ExtensionsMethod.renderImage(this._image.src, this._image.extension, this._image.base64,
                    this._image.width, this.image.height);
                this.header = _image.outerHTML;
            }
        } else if (this._displayStyle == DisplayStyleEnum.ImageAndText) {
            if (this._image) {
                let _image = ExtensionsMethod.renderImage(this._image.src, this._image.extension, this._image.base64,
                    this._image.width, this._image.height);
                this.header = _image.outerHTML + '<div style="margin-left:5px;">' + this._text + '</div>';
            }
        } else if (this._displayStyle == DisplayStyleEnum.Text) {
            this.header = this._text;
        }

        // delay a litle bit of time for image loaded
        setTimeout(() => {
            this.renderWidth();
        }, 200);
    }

    public renderWidth() {
        if (!document.body.contains(this.hostElement)) return;

        let _style = getComputedStyle(this.hostElement);
        let _zFontName = _style.fontFamily ? _style.fontFamily : BravoSettings.current.zDefaultFontName;
        let _nFontSize = _style.fontSize ? _style.fontSize : BravoSettings.current.nFontSize;
        let _textMetric = BravoGraphicsRenderer.measureString(this.hostElement.textContent, new Font(_zFontName, _nFontSize));
        let _widthNew = _textMetric.width;
        // add dropdown button width
        let _btnElement = this.hostElement.querySelector('.wj-input-group-btn');
        if (_btnElement) {
            _style = getComputedStyle(_btnElement);
            _widthNew += Number(_style.width.replace('px', ''));
            _widthNew += Number(_style.marginLeft.replace('px', ''));
            _widthNew += Number(_style.marginRight.replace('px', ''));
        }

        if (this.displayStyle == DisplayStyleEnum.ImageAndText) {
            // add text margin
            let _textElement = this._hdr.querySelector('div');
            if (_textElement) {
                _style = getComputedStyle(_textElement);
                _widthNew += Number(_style.marginLeft.replace('px', ''));
                _widthNew += Number(_style.marginRight.replace('px', ''));
            }
        }

        if (this.displayStyle == DisplayStyleEnum.ImageAndText || this.displayStyle == DisplayStyleEnum.Image) {
            // add img width
            let _imgElement = this._hdr.querySelector('img');
            if (_imgElement) {
                _style = getComputedStyle(_imgElement);
                _widthNew += Number(_style.width.replace('px', ''));
                _widthNew += Number(_style.marginLeft.replace('px', ''));
                _widthNew += Number(_style.marginRight.replace('px', ''));
            }
        }

        let _formControlElement = <HTMLElement>this.hostElement.querySelector('.wj-form-control');
        if (_formControlElement) {
            _style = getComputedStyle(_formControlElement);
            let _padLeft = Number(_style.paddingLeft.replace('px', ''));
            let _padRight = Number(_style.paddingRight.replace('px', ''));
            _widthNew += _padLeft + _padRight;
        }

        // add more
        _widthNew += 5;

        this.hostElement.style.minWidth = _widthNew.toString() + 'px';
    }

    protected _handleOnFormatItem(s: wji.ListBox, e: wji.FormatItemEventArgs) {
        let _item = e.data;
        if (_item.bBelongsToDropDown == false) return;
        if (!(_item instanceof Spliter)) {
            e.item.setAttribute('wj-menuitem-index', e._index.toString());
            e.item.classList.add('wj-menuitem');

            while (e.item.firstChild) {
                e.item.removeChild(e.item.firstChild);
            }
            let _customItem = _item.customItem;
            if (_customItem) {
                if (_customItem instanceof HTMLElement) {
                    e.item.appendChild(_customItem);
                } else if (_customItem instanceof wjc.Control) {
                    e.item.appendChild(_customItem.hostElement);
                } else if (_customItem == true) {
                    e.item.appendChild(_item.hostElement);
                }
                e.item.removeEventListener('mousemove', this._bindHandleOnMouseMove, false);
                e.item.addEventListener('mousemove', this._bindHandleOnMouseMove, false);
                return;
            }

            let _divLeft = document.createElement('div');
            _divLeft.classList.add('wj-left');
            let _divMid = document.createElement('div');
            _divMid.classList.add('wj-middle');

            if (!_item.visible) {
                e.item.classList.add('wj-state-disabled', 'wj-state-hidden');
            } else if (!_item.enabled) {
                e.item.classList.add('wj-state-disabled');
            }

            if (_item.enabled) {
                e.item.classList.remove('wj-state-disabled');
            }

            if (_item.visible) {
                e.item.classList.remove('wj-state-hidden');

                if (_item instanceof DropDown) {
                    e.item.classList.add('wj-subitems');
                }

                let _image: HTMLElement;

                if (_item.image && _item.image.src) {
                    _image = ExtensionsMethod.renderImage(_item.image.src, _item.image.extension, _item.image.base64);
                }
                if (_item.checked) {
                    if (!_image) {
                        _image = ExtensionsMethod.renderImage(CheckmarkIconPath);
                    } else {
                        _divLeft.classList.add('wj-state-selected');
                    }
                }
                if (_image) {
                    _divLeft.appendChild(_image);
                }

                let _divText = document.createElement('span');
                if (this.isContentHtml)
                    _divText.innerHTML = _item.text || '';
                else
                    _divText.innerText = _item.text || '';

                _divMid.appendChild(_divText);

                if (this.bAllowAppendLeft)
                    e.item.appendChild(_divLeft);

                e.item.appendChild(_divMid);

                e.item.removeEventListener('mousemove', this._bindHandleOnMouseMove, false);
                e.item.addEventListener('mousemove', this._bindHandleOnMouseMove, false);
            }
        }
        else {
            e.item.classList.add('wj-state-disabled', 'wj-separator');
            if (!_item.visible) {
                e.item.classList.add('wj-state-hidden');
            } else {
                e.item.classList.remove('wj-state-hidden');
            }
        }
    }

    private _subscriptionShow: Subscription;

    private _delayMouseMove;
    protected _handleOnMouseMove(e: MouseEvent) {
        if (this.bMouseHoverDisable) return;
        if (e.buttons > 0) return;
        if (!this.isDroppedDown) return;
        /// [OPTION] add some smooth
        if (this._delayMouseMove) {
            return;
        }
        this._delayMouseMove = setTimeout(() => {
            this._delayMouseMove = null;
        }, 50);
        //get element
        let _target = <HTMLElement>e.target;
        let _element: HTMLElement;
        if (_target.classList.contains('wj-menuitem')) {
            _element = _target;
        }
        else {
            _element = <HTMLElement>_target.closest('.wj-menuitem');
        }

        if (_element) {
            let _index = Number(_element.getAttribute('wj-menuitem-index'));
            if (this.selectedIndex != _index) {
                this.selectedIndex = _index;
                if (this._subscriptionShow) {
                    this._subscriptionShow.unsubscribe();
                    this._subscriptionShow = null;
                }
                this._subscriptionShow = this._asyncChangeSelect(_index).subscribe((_result) => {
                    this._afterShowSubDropDown(_result);
                });
            }
        }
    }

    private _handleOnMouseEnter(_result, e: MouseEvent) {
        this.selectedIndex = _result.index;
        // this.selectedIndex = this._subBravoDropDown2._parentIndex;
        if (this._subscriptionShow) {
            this._subscriptionShow.unsubscribe();
            this._subscriptionShow = null;
        }
    }

    private _afterShowSubDropDown(_result) {
        if (_result.state == 2 && this._subBravoDropDown) {
            // clear delay time when end-user move to sub dropdown
            if (this._bindHandleOnMouseEnter) {
                this._subBravoDropDown.dropDown.removeEventListener('mouseenter', this._bindHandleOnMouseEnter, false);
            }
            this._bindHandleOnMouseEnter = this._handleOnMouseEnter.bind(this, _result);
            this._subBravoDropDown.dropDown.addEventListener('mouseenter', this._bindHandleOnMouseEnter, false);
        }
    }

    private _handleOnKeyPress(e: KeyboardEvent) {
        let _lb = this.listBox;
        // honor defaultPrevented
        if (e.defaultPrevented) return;

        // don't interfere with inner input elements (TFS 132081)
        if (e.target instanceof HTMLInputElement) return;

        // auto search
        if (e.charCode > 32 || (e.charCode == 32 && _lb._search)) {
            e.preventDefault();

            // update search string
            _lb._search += String.fromCharCode(e.charCode).toLowerCase();
            if (_lb._toSearch) {
                clearTimeout(_lb._toSearch);
            }
            _lb._toSearch = setTimeout(() => {
                _lb._toSearch = null;
                _lb._search = '';
            }, 600);

            // perform search
            let index = this._listBoxMoveNext(); // multi-char search
            if (index < 0 && _lb._search.length > 1) {
                _lb._search = _lb._search[_lb._search.length - 1];
                index = this._listBoxMoveNext(); // single-char search
            }
            if (index > -1) {
                this.selectedIndex = index;

                let _item = this.itemsSource[this.selectedIndex];
                if (_item) {
                    if (this._subBravoDropDown && this._subBravoDropDown.isDroppedDown) {
                        this._subBravoDropDown.hide(13);
                    }

                    if (_item instanceof DropDown) {
                        this._showSubBravoMenuItem(index);
                    }
                    else if (_item.hotKey) {
                        this.onItemClicked();
                    }
                }
            }
        }
    }

    private _listBoxMoveNext(): number {
        let _lb = this.listBox;

        if (_lb.hostElement) {
            let cnt = _lb.hostElement.childElementCount,
                start = _lb.selectedIndex;

            // start searching from current or next item
            if (start < 0 || _lb._search.length == 1) {
                start++;
            }

            // search through the items (with wrapping)
            for (let off = 0; off < cnt; off++) {
                let index = (start + off) % cnt,
                    txt = _lb.getDisplayText(index).trim().toLowerCase();
                if (txt.indexOf(_lb._search) == 0 && _lb.isItemEnabled(index)) {
                    return index;
                }
            }
        }
        // not found
        return -1;
    }

    private _moveFocusToParent() {
        if (this._ownerElement) {
            if (this._ownerElement.tabIndex < 0) {
                wjc.moveFocus(this._ownerElement, 0); // TFS 321472
            } else {
                this._ownerElement.focus();
            }
        }
    }

    protected _getTopParent() {
        let _result = this._parentBravoDropDown;
        while (_result && _result._parentBravoDropDown) {
            if (_result._parentBravoDropDown)
                _result = _result._parentBravoDropDown;
        }
        return _result || this;
    }

    private _subscriptionHide: Subscription;
    protected _handleOnBlurPopUp(e: MouseEvent) {
        let _element = (<HTMLElement>e.target).closest('.wj-menuitem');
        if (_element) return;
        else {
            let _flagClose = this._checkIsNotContains(<HTMLElement>e.target);
            if (_flagClose) {
                this.selectedIndex = -1;
                this._subscriptionHide = this._asyncHide().subscribe(() => {
                })
            }
        }
    }

    private _asyncHide() {
        let _observer = new Observable(observer => {
            if (this.isDroppedDown)
                this.hide(4);
            observer.complete();
        });
        return concat(timer(300), _observer);
    }

    protected _checkIsNotContains(element: HTMLElement): boolean {
        let _flagClose = !wjc.contains(this.dropDown, element);
        if (this._subBravoDropDown) {
            _flagClose = _flagClose && this._subBravoDropDown._checkIsNotContains(element);
        }
        return _flagClose;
    }

    private _containsFocus(): boolean {
        return super.containsFocus() ||
            (this.isDroppedDown && wjc.contains(this._dropDown, wjc.getActiveElement()));
    }

    protected _handleSubMenuItemClicked(s: DropDown, e: ItemDropDownEventArgs) {
        this.onMenuItemSelected(this, s, e);

    }

    _dropDownClick(e) {
        if (this.selectedItem && this.selectedItem.customItem) {
            let _dropdown = this.selectedItem.customItem.dropDown;
            if (_dropdown) {
                _dropdown.addEventListener('mousedown', (e: MouseEvent) => { e.stopPropagation(); })
            }
        }
        else if (this.selectedItem instanceof DropDown) {
            this.onItemClicked();
        }
        else {
            super._dropDownClick(e);
        }

    }
    private _getScrollbarWidth() {

        // Creating invisible container
        const _outerDiv = document.createElement('div');
        _outerDiv.style.visibility = 'hidden';
        _outerDiv.style.overflow = 'scroll'; // forcing scrollbar to appear
        _outerDiv.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(_outerDiv);

        // Creating inner element and placing it in the container
        const _innerDiv = document.createElement('div');
        _outerDiv.appendChild(_innerDiv);

        // Calculating difference between container's full width and the child width
        const _scrollbarWidth = (_outerDiv.offsetWidth - _innerDiv.offsetWidth);

        // Removing temporary elements from the DOM
        _outerDiv.parentNode.removeChild(_outerDiv);

        return _scrollbarWidth;

    }
    dispose() {
        this._removeListener();
        if (this._subscriptionHide)
            this._subscriptionHide.unsubscribe();
        if (this._subscriptionShow)
            this._subscriptionShow.unsubscribe();
        if (this._itemsSource) {
            this._itemsSource.forEach(_item => {
                _item = wjc.tryCast(_item, 'IBravoToolStrip') as IBravoToolStrip;
                if (_item) {
                    _item.dispose();
                }
            });
            this._itemsSource.clear();
        }
        super.dispose();
    }
}

export function isPropertyItemsChanged(pItems: Array<any>): boolean {
    return pItems.some((_item) => {
        return _item.isChanged || false;
    });
}

export function refreshPropertyItemsState(pItems: Array<any>) {
    pItems.every((_item) => {
        if (_item.isChanged) {
            _item.isChanged = false;
        }
        return true;
    });
}

export class ItemDropDownEventArgs extends EventArgs {
    public readonly zItemName: string;
    public readonly zGroupName: string;
    public readonly item: any;
    public readonly dropDownSender: DropDown;

    constructor(pItem: any, pzItemName: string, pzGroupName?: string, pDropDownSender?: DropDown) {
        super();
        this.item = pItem;
        this.zItemName = pzItemName;
        this.zGroupName = pzGroupName || '';
        this.dropDownSender = pDropDownSender;
    }
}

export class Spliter extends wjc.Control implements IBravoToolStrip {
    constructor() {
        super(document.createElement('hr'));
        this.created();
    }

    created() {
        wjc.addClass(this.hostElement, 'hidden');
    }

    private _name: string = 'spliter';
    public get name(): string {
        return this._name;
    }
    private _text: string = '';
    public get text(): string {
        return this._text;
    }
    public set text(value: string) {
        this._text = value;
    }

    private _image: Image = null;
    public get image(): Image {
        return this._image;
    }
    private _displayStyle: DisplayStyleEnum = null;
    public get displayStyle(): DisplayStyleEnum {
        return this._displayStyle;
    }
    private _alignment: AlignmentEnum = null;
    public get alignment(): AlignmentEnum {
        return this._alignment;
    }

    tag: any;

    private _header: string;
    public get header(): string {
        return this._header;
    }
    private _key: string;
    public get key(): string {
        return this._key;
    }
    private _hotKey: string;
    public get hotKey(): string {
        return this._hotKey;
    }
    private _className: string;
    public get className(): string {
        return this._className;
    }
    private _url: string;
    public get url(): string {
        return this._url;
    }
    private _clickedFunction: Function;
    public get clickedFunction(): Function {
        return this._clickedFunction;
    }
    public readonly propertyChanged = new Event();

    private _isChanged: boolean = false;
    public get isChanged(): boolean {
        return this._isChanged;
    }

    public set isChanged(value: boolean) {
        this._isChanged = value;
    }

    private _visible: boolean = true;
    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;
            this._isChanged = true;
            if (this.propertyChanged)
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('visible', this._visible));
        }
    }

    private _enabled: boolean = false;
    public get enabled(): boolean {
        return this._enabled;
    }

    private _mergeAction = MergeAction.Append;

    public get mergeAction(): MergeAction {
        return this._mergeAction;
    }

    public set mergeAction(value: MergeAction) {
        let _act: any = value;
        if (wjc.isString(value))
            _act = MergeAction[value];

        this._mergeAction = _act;
    }

    private _checked: boolean;
    public get checked(): boolean {
        return this._checked;
    }
    private _canCheck: boolean;
    public get canCheck(): boolean {
        return this._canCheck;
    }
    bBelongsToDropDown: boolean = true;

    updateHeader(pzText: string, pDisplayStyle: DisplayStyleEnum, pImage?: Image) {
    }

    renderWidth() {
    }

    implementsInterface(interfaceName: string): boolean {
        return interfaceName == 'IBravoToolStrip';
    }

    refresh(fullUpdate = true) {
        if (!this.visible) {
            this.hostElement.classList.add('wj-state-disabled', 'wj-state-hidden');
        } else if (!this.enabled) {
            this.hostElement.classList.add('wj-state-disabled');
        }

        if (this.enabled) {
            this.hostElement.classList.remove('wj-state-disabled');
        }

        if (this.visible) {
            this.hostElement.classList.remove('wj-state-hidden');
        }
    }
}