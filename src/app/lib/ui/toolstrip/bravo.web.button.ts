import * as wjc from 'wijmo/wijmo';
import { Image, Event, DisplayStyleEnum, AlignmentEnum, ExtensionsMethod } from '../../core/core';
import { Font } from '../font';
import { BravoGraphicsRenderer } from '../bravo.graphics.renderer';
import { IBravoToolStrip } from '../interface/IBravoToolStrip';
import { BravoSettings } from '../bravo.settings';
import { PropertyChangedEventArgs } from '../eventArgs/propertyChanged.eventargs';
import { Enum } from '../components/bravo.decorator';

export class BravoWebButton extends wjc.Control {

    public readonly propertyChanged = new Event();

    static controlTemplate = '<div class="wj-input">' +
        '<div class="wj-input-group">' +
        '<div wj-part="header" class="wj-form-control"/>' +
        '</div>' +
        '</div>';

    protected _bindHandleOnClick = this._handleOnClick.bind(this);
    _hdr: HTMLElement;

    private _bBelongsToDropDown: boolean = false;

    public get bBelongsToDropDown(): boolean {
        return this._bBelongsToDropDown;
    }
    public set bBelongsToDropDown(value: boolean) {
        this._bBelongsToDropDown = value;
    }

    constructor(phostElement: HTMLElement, options?: any, pItem?: IBravoToolStrip) {
        super(phostElement, options);
        this._initialControl();
        this._addListener();

        this._itemsSource = pItem;
    }

    protected _itemsSource: any

    get itemsSource() {
        return this._itemsSource;
    }

    set itemsSource(val) {
        this._itemsSource = val;
    }

    get header(): string {
        if (this._hdr)
            return this._hdr.innerHTML;
        else
            return undefined;
    }

    set header(value: string) {
        if (this._hdr)
            this._hdr.innerHTML = wjc.asString(value);
    }

    protected _displayStyle: DisplayStyleEnum = DisplayStyleEnum.ImageAndText;

    @Enum(DisplayStyleEnum)
    public get displayStyle() {
        return this._displayStyle;
    }

    public set displayStyle(val: DisplayStyleEnum) {
        if (this._displayStyle != val) {
            this._displayStyle = val || DisplayStyleEnum.ImageAndText;
            this.invalidate(true);
        }
    }

    protected _alignment: AlignmentEnum = AlignmentEnum.Left;

    @Enum(AlignmentEnum)
    public get alignment(): AlignmentEnum {
        return this._alignment;
    }

    public set alignment(val: AlignmentEnum) {
        this._alignment = val;
    }
    protected _name: string = '';

    public get name() {
        return this._name;
    }

    public set name(val) {
        this._name = val;
    }

    protected _text: string = '';
    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        if (this._text != value) {
            this._text = value;
            this._isChanged = true;
            if (this.propertyChanged.hasHandlers) {
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('text', this._text));
            }
            this.invalidate(true);
        }
    }
    private _visible: boolean = true;

    public get visible(): boolean {
        return this._visible;
    }
    public set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;
            this._isChanged = true;
            if (this.propertyChanged.hasHandlers) {
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('visible', this._visible));
            }
            this.invalidate(true);
        }
    }

    private _enabled: boolean = true;

    public get enabled(): boolean {
        return this._enabled;
    }
    public set enabled(value: boolean) {
        if (this._enabled != value) {
            this._enabled = value;
            this._isChanged = true;
            if (this.propertyChanged.hasHandlers) {
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('enabled', this._enabled));
            }
            this.invalidate(true);
        }
    }
    protected _image: Image = new Image('');

    public get image() {
        return this._image;
    }

    public set image(val) {
        this._image = val;
        if (this._image != val) {
            this._image = val;
            this._isChanged = true;
            if (this.propertyChanged.hasHandlers) {
                this.propertyChanged.raise(this, new PropertyChangedEventArgs('image', this._image));
            }
            this.invalidate(true);
        }
    }

    private _clickedFunction: Function;

    public get clickedFunction(): Function {
        return this._clickedFunction;
    }

    public set clickedFunction(value: Function) {
        this._clickedFunction = wjc.asFunction(value);
    }

    protected _tag: any;

    public get tag() {
        return this._tag;
    }

    public set tag(val) {
        this._tag = val;
    }

    protected _isChanged: boolean = false;

    public get isChanged(): boolean {
        return this._isChanged;
    }
    public set isChanged(value: boolean) {
        this._isChanged = value;
    }

    private _customItem: any;

    public get customItem(): any {
        return this._customItem;
    }
    public set customItem(value: any) {
        if (this._customItem != value) {
            this._customItem = value;
            this._isChanged = true;
            this.propertyChanged.raise(this, new PropertyChangedEventArgs('customItem', this._customItem));
        }
    }

    protected _initialControl() {
        let tpl = this.getTemplate();
        this.applyTemplate('wj-control wj-content bravo-button', tpl, {
            _hdr: 'header',
        }, 'header');
        this.renderWidth();
    }

    protected _addListener() {
        this.addEventListener(this._hdr, 'click', this._bindHandleOnClick, false);
    }

    protected _removeListener() {
        this.removeEventListener(this._hdr, 'click', this._bindHandleOnClick, false);
        this.menuItemSelected.removeAllHandlers();
    }

    public updateHeader(pzText: string, pDisplayStyle: DisplayStyleEnum, pImage?: Image) {
        if (!this._hdr) return;

        if (!pImage || (pImage && (!pImage.src && !pImage.base64))) {
            this.displayStyle = DisplayStyleEnum.Text;
        } else {
            this.displayStyle = pDisplayStyle;
            this._image = pImage;
        }

        this._text = pzText || '';

        let _nImgWidth = 16;

        if (this._displayStyle == DisplayStyleEnum.Image) {
            if (this._image) {
                _nImgWidth = this._image.width == -1 ? _nImgWidth : this._image.width;
                let _image = ExtensionsMethod.renderImage(this._image.src, this._image.extension, this._image.base64, _nImgWidth);
                this.header = _image.outerHTML;
            }
        } else if (this._displayStyle == DisplayStyleEnum.ImageAndText) {
            if (this._image) {
                let _image = ExtensionsMethod.renderImage(this._image.src, this._image.extension, this._image.base64, _nImgWidth);
                if (this._text) {
                    this.header = _image.outerHTML + '<div style="margin-left:5px;">' + this._text + '</div>';
                }
                else {
                    this.header = _image.outerHTML;
                }
            }
        } else if (this._displayStyle == DisplayStyleEnum.Text) {
            this.header = this._text;
        }

        wjc.setCss(this._hdr, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // padding: '3px'
        });
        this.renderWidth();
    }

    public renderWidth() {
        if (!this._hdr) return;
        if (!document.body.contains(this.hostElement)) return;

        let _style = getComputedStyle(this.hostElement);
        let _zFontName = _style.fontFamily ? _style.fontFamily : BravoSettings.current.zDefaultFontName;
        let _nFontSize = _style.fontSize ? _style.fontSize : BravoSettings.current.nFontSize;
        let _textMetric = BravoGraphicsRenderer.measureString(this.hostElement.textContent, new Font(_zFontName, _nFontSize));
        let _widthNew = _textMetric.width;
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

    private _handleOnClick(e: MouseEvent) {
        this.onItemClicked();
    }
    public readonly menuItemSelected = new Event();

    onItemClicked() {
        if (wjc.isFunction(this.clickedFunction)) {
            this.clickedFunction(this);
        } else {
            if (this.menuItemSelected.hasHandlers) {
                this.menuItemSelected.raise(this, this.itemsSource);
            }
        }
    }

    refresh(fullUpdate = true) {
        if (this.bBelongsToDropDown) return;
        super.refresh(fullUpdate)
        this.updateHeader(this.text, this.displayStyle, this.image);

        if (this.hostElement) {
            if (!this.visible) {
                this.hostElement.classList.add('wj-state-disabled', 'wj-state-hidden');
            }
            else if (!this.enabled) {
                this.hostElement.classList.add('wj-state-disabled');
            }
            else {
                this.hostElement.classList.remove('wj-state-disabled');
                this.hostElement.classList.remove('wj-state-hidden');
            }
        }
    }

    dispose() {
        this._removeListener();
        super.dispose();

    }
}

