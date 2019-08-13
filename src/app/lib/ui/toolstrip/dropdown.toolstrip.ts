import * as wjc from 'wijmo/wijmo';
import * as wji from 'wijmo/wijmo.input';
import { ExtensionsMethod } from '../../core/core';
import { IBravoToolStrip } from '../interface/IBravoToolStrip';
import { ToolStrip } from './toolstrip';
import { DropDown } from '../../../controller/dropdown';
import { PropertyChangedEventArgs } from '../eventArgs/propertyChanged.eventargs';
import { MergeAction } from '../enums';

export class DropDownToolStrip extends DropDown implements IBravoToolStrip {
    private _hotKey: string = '';

    public get hotKey(): string {
        return this._hotKey;
    }
    public set hotKey(value: string) {
        if (this._hotKey != value) {
            this._hotKey = value;
            this._isChanged = true;
            this.propertyChanged.raise(this, new PropertyChangedEventArgs('hotKey', this._hotKey));
        }
    }

    private _className: string = '';

    public get className(): string {
        return this._className;
    }
    public set className(value: string) {
        this._className = value;
    }

    private _url: string = '';

    public get url(): string {
        return this._url;
    }
    public set url(value: string) {
        this._url = value;
    }

    private _clickedFunction: Function;

    public get clickedFunction(): Function {
        return this._clickedFunction;
    }
    public set clickedFunction(value: Function) {
        this._clickedFunction = value;
    }

    private _checked: boolean = false;

    public get checked(): boolean {
        return this._checked;
    }
    public set checked(value: boolean) {
        if (this._checked != value) {
            this._checked = value;
            this._isChanged = true;
            this.propertyChanged.raise(this, new PropertyChangedEventArgs('checked', this._checked));
        }
    }

    private _canCheck: boolean = false;

    public get canCheck(): boolean {
        return this._canCheck;
    }
    public set canCheck(value: boolean) {
        this._canCheck = value;
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

    public constructor(pzName: string, hostElement?: HTMLElement, ...pItems: Array<any>) {
        super(hostElement || document.createElement('div'), pItems);
        this._ownerElement = this.hostElement;
        this.name = pzName;
    }

    protected _initialControl() {
        super._initialControl();
        this.hostElement.classList.add('bravo-toolstrip');
        let _btn = this.hostElement.querySelector('.wj-btn.wj-btn-default');
        wjc.setCss(_btn, {
            backgroundColor: 'transparent'
        });
    }

    protected _handleOnFormatItem(s, e: wji.FormatItemEventArgs) {
        let _item: IBravoToolStrip = e.data;
        if (_item.bBelongsToDropDown == false) return;
        super._handleOnFormatItem(s, e);
        if (_item instanceof ToolStrip) {
            let _customItem = _item.customItem;
            if (!_customItem) {
                let _divMid = <HTMLElement>e.item.querySelector('.wj-middle');
                if (_divMid) {
                    let _divText = <HTMLElement>_divMid.querySelector('span');
                    if (_item.name) {
                        if (_divText)
                            _divText.remove();
                        else
                            _divText = document.createElement('span');

                        _divText = ExtensionsMethod.renderLink(_item.className, _item.name, _item.text);
                        _divText.addEventListener('click', (e2: MouseEvent) => {
                            e2.preventDefault();
                            if (e2.target instanceof HTMLElement) {
                                let _element = <HTMLElement>e2.target.closest('.wj-menuitem');
                                _element.click();
                            }
                        });
                        _divMid.appendChild(_divText);
                    } else if (_item.url) {
                        if (_divText)
                            _divText.remove();
                        else
                            _divText = document.createElement('span');

                        _divText = document.createElement('a');
                        _divText.classList.add('bravo-toolstrip-link');
                        _divText.setAttribute('href', _item.url);
                        _divText.addEventListener('click', (e2: MouseEvent) => {
                            e2.preventDefault();
                            if (e2.target instanceof HTMLElement) {
                                let _element = <HTMLElement>e2.target.closest('.wj-menuitem');
                                _element.click();
                            }
                        });
                        _divText.innerText = _item.text || '';
                        _divMid.appendChild(_divText);
                    }

                    if (_item.hotKey) {
                        let _hotKey = document.createElement('span');
                        _hotKey.classList.add('bravo-toolstrip-hotkey');
                        _hotKey.textContent = _item.hotKey;
                        _divMid.insertBefore(_hotKey, _divMid.children[0]);
                    }
                }
            }
        } else if (_item instanceof DropDownToolStrip) {
            let _divMid = <HTMLElement>e.item.querySelector('.wj-middle');

            if (_item.hotKey && _divMid) {
                let _hotKey = document.createElement('span');
                _hotKey.classList.add('bravo-toolstrip-hotkey');
                _hotKey.textContent = _item.hotKey;
                _divMid.insertBefore(_hotKey, _divMid.children[0]);
            }
        }
    }

    protected _renderDropdownWidth(pSetWidth = true) {
        let _widthNew = super._renderDropdownWidth(false);
        if (_widthNew == -1) return -1;

        // add hotkey width
        let _divHotKey = this.dropDown.querySelector('.bravo-toolstrip-hotkey');
        if (_divHotKey) {
            let _style = getComputedStyle(_divHotKey);
            _widthNew += Number(_style.width.replace('px', ''));
            _widthNew += Number(_style.marginLeft.replace('px', ''));
            _widthNew += Number(_style.marginRight.replace('px', ''));
        }

        if (pSetWidth) {
            wjc.setCss(this.dropDown, {
                minWidth: _widthNew.toString() + 'px'
            })
        }

        return _widthNew;
    }

    dispose() {
        super.dispose();
    }

    implementsInterface(interfaceName: string): boolean {
        return interfaceName == 'IBravoToolStrip';
    }

}