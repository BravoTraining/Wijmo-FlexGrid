import * as wjc from 'wijmo/wijmo';
import { IBravoToolStrip } from '../interface/IBravoToolStrip';
import { BravoWebButton } from '../toolstrip/bravo.web.button';
import { PropertyChangedEventArgs } from '../eventArgs/propertyChanged.eventargs';
import { MergeAction } from '../enums';

export class ToolStrip extends BravoWebButton implements IBravoToolStrip {

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

    constructor(pzName: string, phostElement?: HTMLElement, pzText?: string) {
        super(phostElement || document.createElement('div'));

        this.text = pzText;
        this.name = pzName;
    }
    
    implementsInterface(interfaceName: string): boolean {
        return interfaceName == 'IBravoToolStrip';
    }
}