import { tryCast } from "wijmo/wijmo";
import { CryptoExtension } from "../crypto.extension";

const ExpressionAttribute: string = "Expression";
const AbbvExpressionAttribute = "Expr";

export class BravoLayoutItem {
    public static readonly LayoutNameAttribute = "LayoutName";

    public name: string;
    public value: any;
    public description: string;
    public attributes: any;
    public type: string;

    private _parentItem: BravoLayoutItem;

    public set parentItem(val: BravoLayoutItem) {
        this._parentItem = val;
    }

    public get parentItem(): BravoLayoutItem {
        return this._parentItem;
    }

    public get bHasAttributes(): boolean {
        return this.attributes && Object.keys(this.attributes).length > 0;
    }

    constructor(name?: string, value?: any, description?: string, attributes?: any) {
        this.name = name;
        this.value = value;
        this.description = description;
        this.attributes = attributes || {};
    }

    public get bIsData(): boolean {
        return tryCast(this.value, "IBravoLayoutData") != null ? true : false;
    }

    public isExpression() {
        return this.bHasAttributes &&
            ((this.attributes[ExpressionAttribute] && this.attributes[ExpressionAttribute] == "True") ||
                (this.attributes[AbbvExpressionAttribute] && this.attributes[AbbvExpressionAttribute] == "True"))
    }

    public data() {
        return tryCast(this.value, "IBravoLayoutData");
    }

    public bool() {
        return this.value == 'true' || this.value == 'True';
    }

    public number() {
        return Number.asNumber(this.value);
    }

    public object() {
        try {
            let _buff = CryptoExtension.stringBase64toArrayBuff(this.value);
            if (!_buff) return null;

            var decodedString = String.fromCharCode.apply(null, new Uint8Array(_buff));
        }
        catch (_ex) {
            throw new Error(_ex);
        }
    }

    public str(pzLangKey?): string {
        if (this.value) {
            let _l = this.value;
            if (_l && tryCast(this.value, "IBravoLayoutData") != null) return _l.contains(pzLangKey) && _l.get(pzLangKey) ?
                _l.get(pzLangKey).value : String.empty;
        }

        return this.value;
    }
}