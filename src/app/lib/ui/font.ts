import { BravoSettings } from './bravo.settings';
// import { pxToPt } from '';

export class Font {
    private _fontFamily: any = 'Segoe UI';

    public get FontFamily(): any {
        return this._fontFamily;
    }

    private _nSize: number = 9.75;

    public get nSize() {
        return this._nSize;
    }

    public get Size(): string {
        return `${this._nSize}pt`;
    }

    private _fontWeight: string;

    public get fontWeight(): string {
        return this._fontWeight;
    }

    private _fontStyle: string;

    public get FontStyle(): string {
        return this._fontStyle;
    }

    private _textDecoration: string;

    public get textDecoration(): string {
        return this._textDecoration;
    }

    public get Italic(): boolean {
        return this.FontStyle == 'italic';
    }

    public get Underline(): boolean {
        return this.textDecoration == 'underline';
    }

    public get Strikeout(): boolean {
        return this.textDecoration == 'line-through';
    }

    constructor(family: string, size: any, style: any = FontStyle.Regular) {
        this._fontFamily = family;
        this._nSize = this._getFontSize(size);

        if (style in FontStyle) {
            if (style & FontStyle.Bold)
                this._fontWeight = 'bolder';
            if (style & FontStyle.Italic)
                this._fontStyle = 'italic';

            if (style & FontStyle.Underline)
                this._textDecoration = 'underline';
            else if (style & FontStyle.Strikeout)
                this._textDecoration = 'line-through';
        }
    }

    private _getFontSize(size: any): number {
        if (Number.isNumber(size))
            return size;

        if (typeof size === 'string') {
            let _rgx = new RegExp('([0-9]*\.?[0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)');
            let _groups = size.match(_rgx);
            if (_groups == null || _groups.length != 3) return BravoSettings.current.nFontSize;

            let _nSize = Number.asNumber(_groups[1]);
            switch (_groups[2]) {
                case 'px':
                    // return pxToPt(_nSize);

                case 'pt':
                    return _nSize;

                default:
                    throw new Error('Not support convert' + _groups[2]);
            }
        }
    }
}

export enum FontStyle {
    Regular = 0,
    Bold = 1,
    Italic = 2,
    Underline = 4,
    Strikeout = 8
}