import { MessageContstants } from '../common/message.constants';
import { BravoLangEnum, OperatorEnum, OperatorTypeEnum, DatePartEnum } from '../enums';
import { BravoCulture } from '../bravo.culture';

import { Event, EventArgs } from '../bravo.event';
import { Dictionary } from '../data/bravo.web.dictionary';
import { WebDataRow } from '../data/bravo.web.datarow';
import { BravoExpression } from './bravo.expression';
import { DataRowState, TypeCode } from '../data/enums';
import { BravoClientSettings } from '../bravo.client.settings';
import { WebTable } from '../data/bravo.web.datatable';
import { WebSet } from '../data/bravo.web.dataset';
import { BravoDataTypeConverter, isString, isBoolean } from '../bravo.datatype.converter';
import { BravoDebug } from '../bravo.debug';
import { SensitivityEnum } from '../extensions.method';
import { DateTime } from '../bravo.core';
import { Globalize } from 'wijmo/wijmo';

//#region constants

export const ExprPattern: RegExp = /(?:{=)([^}]+)(?:})/g;
export const RtfExprPattern: RegExp = /(?:\\?{=)([^}]+)(?:})/g;

export const TableSourceKey: string = "Source";
export const TableAliasKey: string = "Alias";
export const TableExpressionCollection: string = "Expressions";

// Parent qualifier
const PARENT_QUALIFIER: string = "PARENT";

// Child qualifier
const CHILD_QUALIFIER: string = "CHILD";

// The null value
const NULL_VALUE: string = "NULL";

// The variable prefix
const VARIABLE_PREFIX = "$";

const PARAMETER_PREFIX = "@";

export const INVALID_VALUE: string = "#VALUE";

//#endregion constants

// @dynamic

export class BravoExpressionEvaluator {
    //#region static members

    /**
     * Static event occurs when a global system value is required
     */
    public static readonly onValueRequired = new Event();

    /**
     * The expression keywords. The keyword is ignore in evaluate.
     */
    private static readonly Keywords: string[] = ["true", "false"];

    private static EmptyDate: Date = new Date(1900, 1, 1);

    public static containsExpression(pzText: string): boolean {
        let _regex = new RegExp(ExprPattern);
        return _regex.test(pzText);
    }

    public static escapeRtfUnicode(pzText: string) {
        if (String.isNullOrEmpty(pzText))
            return;

        let _sb = '';
        for (let _i = 0; _i < pzText.length; _i++) {
            let _nCode = pzText.charCodeAt(_i);
            if (_nCode > 127) {
                _sb += `\\u`;
                _sb += _nCode;
                _sb += '?';
            }
            else {
                _sb += pzText.charAt(_i);
            }
        }

        return _sb;
    }

    /**
     * Print the expression diagram
     */
    public static print(expression: BravoExpression | BravoExpression[]): string {
        if (expression instanceof Array) {
            let _sb = String.empty;

            for (const _e of expression) {
                if (_sb.length > 0)
                    _sb += ";\n";

                _sb += BravoExpressionEvaluator.print(_e);
            }

            return _sb;
        }

        if (expression == BravoExpression.Empty)
            return String.empty;

        if (expression.Operator == OperatorEnum.Value)
            return `${expression.Value}`;

        let _sb = String.empty;
        for (const childExpression of expression.Expressions) {
            if (_sb.length > 0) _sb += ',';
            _sb += BravoExpressionEvaluator.print(childExpression);
        }

        return String.format("{0}({1})", OperatorEnum[expression.Operator], _sb);
    }

    public static quoteExpression(pzExpression: string) {
        if (pzExpression && !pzExpression.includes("{="))
            return "{=" + pzExpression + "}";

        return pzExpression;
    }

    public static unquoteExpression(pzExpression: string) {
        if (pzExpression && pzExpression.startsWith("{=") && pzExpression.endsWith("}"))
            return pzExpression.substring(2, pzExpression.length - 3);

        return pzExpression;
    }

    public static getAliasName(pTable: WebTable): string {
        if (!pTable) throw new Error(String.format(MessageContstants.ArgumentNullError, "pTable"));

        if (pTable.extendedProperties.containsKey(TableAliasKey))
            return pTable.extendedProperties.get(TableAliasKey).value;

        return pTable.name;
    }

    /**
     * Return table name from alias if available
     */
    public static getTableName(pzAlias: string, pDataSet: WebSet) {
        if (!pzAlias) throw new Error(String.format(MessageContstants.ArgumentNullError, "pzAlias"));
        if (!pDataSet) throw new Error(String.format(MessageContstants.ArgumentNullError, "pDataSet"));

        for (const _tb of pDataSet.tables) {
            if (_tb instanceof WebTable && _tb.extendedProperties.containsKey(TableAliasKey) &&
                String.compare(_tb.extendedProperties.get(TableAliasKey).value, pzAlias) == 0)
                return _tb.name;
        }

        return pzAlias;
    }

    public static getSourceName(pTable: WebTable) {
        if (!pTable) throw new Error(String.format(MessageContstants.ArgumentNullError, "pTable"));

        if (pTable.extendedProperties.containsKey(TableSourceKey))
            return pTable.extendedProperties.get(TableSourceKey).value;

        return pTable.name;
    }

    /**
     * Return the value is expression keyword
     */
    private static isKeyword(value: string) {
        for (const kw of this.Keywords)
            if (String.compare(kw, value) == 0)
                return true;

        return false;
    }

    /**
     * The generic version
     */
    private static convert<T>(value: Object, type: TypeCode) {
        return <T>BravoDataTypeConverter.convertValue(value, type);
    }

    /**
     * Compare object
     */
    public static compare(lhs: any, rhs: any) {
        let lhsnull = (lhs == null || lhs == undefined);
        let rhsnull = (rhs == null || rhs == undefined);
        if (lhsnull || rhsnull)
            return null;

        return lhs - rhs;
    }

    private static isTrueValue(value: any): boolean {
        if (value == null || value == undefined)
            return false;

        return BravoDataTypeConverter.convertValue(value, TypeCode.Boolean) === true;
    }

    /**
     * Return result of like function
     * @param pattern 
     * @param value 
     */
    private static like(pattern: string, value: string): boolean {
        if (value == null || value == undefined)
            return false;

        let isMatch = true,
            isWildCardOn = false,
            isCharWildCardOn = false,
            isCharSetOn = false,
            isNotCharSetOn = false,
            endOfPattern = false;

        return false;
    }

    /**
     * Addition (+) operator
     * @param lhs 
     * @param rhs 
     */
    public static addition(lhs: any, rhs: any) {
        if (lhs == null || lhs == undefined ||
            rhs == null || rhs == undefined)
            return null;

        if (!Number.isNumber(lhs) || !Number.isNumber(rhs))
            throw new Error('Aggurent is not number');

        return lhs + rhs;
    }

    /**
     * Subtraction (-) operator
     * @param lhs 
     * @param rhs 
     */
    private static subtraction(lhs: any, rhs: any) {
        if (lhs == null || lhs == undefined ||
            rhs == null || rhs == undefined)
            return null;

        if (!Number.isNumber(lhs) || !Number.isNumber(rhs))
            throw new Error('Aggurent is not number');

        return lhs - rhs;
    }

    /**
     * Multiplication (*) operator
     * @param lhs 
     * @param rhs 
     */
    private static multiplication(lhs: any, rhs: any) {
        if (lhs == null || lhs == undefined ||
            rhs == null || lhs == undefined)
            return 0;

        if (!Number.isNumber(lhs) || !Number.isNumber(rhs))
            throw new Error('Aggurent is not number');

        return lhs * rhs;
    }

    /**
     * Division (/) operator
     * @param lhs 
     * @param rhs 
     */
    public static division(lhs: any, rhs: any) {
        if (lhs == null || lhs == undefined ||
            rhs == null || lhs == undefined)
            return 0;

        if (!Number.isNumber(lhs) || !Number.isNumber(rhs))
            throw new Error('Aggurent is not number');

        return lhs / rhs;
    }

    /**
     * Modulus (%) operator
     * @param lhs 
     * @param rhs 
     */
    private static modulus(lhs: any, rhs: any) {
        if (lhs == null || lhs == undefined ||
            rhs == null || lhs == undefined)
            return 0;

        if (!Number.isNumber(lhs) || !Number.isNumber(rhs))
            throw new Error('Aggurent is not number');

        return lhs % rhs;
    }

    /**
     * Abs operator
     * @param value 
     */
    private static abs(value: any) {
        if (value == null || value == undefined)
            return null;

        if (!Number.isNumber(value))
            throw new Error('Aggurent is not number');

        return Math.abs(value);
    }

    private static fix(num: number) {
        if (num > 0)
            return Math.floor(num);

        return -Math.floor(-num);
    }

    public static datePart(datePart: DatePartEnum, date: any): number {
        let _date = <Date>BravoDataTypeConverter.convertValue(date, TypeCode.DateTime);

        switch (datePart) {
            case DatePartEnum.year:
            case DatePartEnum.yy:
            case DatePartEnum.yyyy:
                return _date.year();

            case DatePartEnum.quarter:
            case DatePartEnum.qq:
            case DatePartEnum.q:
                return Math.ceil(_date.month() / 3);

            case DatePartEnum.month:
            case DatePartEnum.mm:
            case DatePartEnum.m:
                return _date.month();

            case DatePartEnum.dayofyear:
            case DatePartEnum.dy:
            case DatePartEnum.y:
                return _date.dayOfYear();

            case DatePartEnum.day:
            case DatePartEnum.dd:
            case DatePartEnum.d:
                return _date.day();

            case DatePartEnum.weekday:
            case DatePartEnum.dw:
                return _date.getDay() + 1;

            case DatePartEnum.week:
            case DatePartEnum.wk:
            case DatePartEnum.ww:
                return 0;

            case DatePartEnum.hour:
            case DatePartEnum.hh:
                return _date.getHours();

            case DatePartEnum.minute:
            case DatePartEnum.mi:
            case DatePartEnum.n:
                return _date.getMinutes();

            case DatePartEnum.second:
            case DatePartEnum.ss:
            case DatePartEnum.s:
                return _date.getSeconds();

            case DatePartEnum.millisecond:
            case DatePartEnum.ms:
                return _date.getMilliseconds();
        }

        throw new Error(String.format("Not support datepart: ", datePart));
    }

    private static dateAdd(datePart: DatePartEnum, number: number, date: any) {
        return Date.dateAdd(datePart, number, date);
    }

    private static dateDiff(datePart: DatePartEnum, startDate: any, endDate: any) {
        return Date.dateDiff(datePart, startDate, endDate);
    }

    private static str(value: number, length: number, scale: number) {
        if (scale > 0) value.round(scale);

        let _text = value.toString();
        let _arr = _text.split('.');
        let _intText: string;

        if (scale > 0) {
            let _intLen = length - scale - 1;
            _intText = _arr[0].substring(Math.max(0, _arr[0].length - _intLen));

            if (_arr.length > 1) {
                var decText = _arr.length > 0 ? _arr[1].substring(0, Math.min(scale, _arr[1].length)) : "";
                return _intText.padStart(_intLen, ' ') + "." + decText.padEnd(scale, '0');
            }
            else {
                return _intText.padStart(_intLen, ' ') + "." + "".padEnd(scale, '0');
            }
        }

        _intText = _arr[0].substring(Math.max(0, _arr[0].length - length));

        return _intText.padStart(length, ' ');
    }

    public static spellAmountUnit(pnNumber: number, pLanguage: BravoLangEnum) {
        if (pLanguage == BravoLangEnum.Vietnamese)
            return this.spellNumberVi(pnNumber, 0, null, null, true);
        else if (pLanguage == BravoLangEnum.English)
            return this.numberToWords(pnNumber, true);
        else
            return String.format("***Not-supported-language: {0}***", BravoLangEnum[pLanguage]);
    }

    public static spellNumber(pnNumber: number, pLanguage: BravoLangEnum, pnDecimals: number = 0,
        pzBasicCurrencyUnit: string = null, pzFractionalCurrencyUnit: string = null) {
        if (pLanguage == BravoLangEnum.Vietnamese)
            return this.spellNumberVi(pnNumber, pnDecimals, pzBasicCurrencyUnit, pzFractionalCurrencyUnit);
        else if (pLanguage == BravoLangEnum.English)
            return this.spellNumberEn(pnNumber, pnDecimals, pzBasicCurrencyUnit, pzFractionalCurrencyUnit);
        else
            return String.format("***Not-supported-language: {0}***", BravoLangEnum[pLanguage]);
    }

    private static numberToWords(pnNumber: number, pbAmountUnit: boolean = false) {
        if (pnNumber == 0)
            return "Zero";

        if (pnNumber < 0)
            return "Minus " + this.numberToWords(Math.abs(pnNumber), pbAmountUnit);

        let _sb = String.empty;
        let _n = Math.trunc(pnNumber / 1000000000000000);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Quadrillion ";
            pnNumber %= 1000000000000000;
        }

        _n = Math.trunc(pnNumber / 1000000000000);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Trillion ";
            pnNumber %= 1000000000000;
        }

        _n = Math.trunc(pnNumber / 1000000000);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Billion ";
            pnNumber %= 1000000000;
        }

        _n = Math.trunc(pnNumber / 1000000);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Million ";
            pnNumber %= 1000000;
        }

        _n = Math.trunc(pnNumber / 1000);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Thousand ";
            pnNumber %= 1000;
        }

        _n = Math.trunc(pnNumber / 100);
        if (_n > 0) {
            _sb += this.numberToWords(_n, pbAmountUnit);
            _sb += " Hundred ";
            pnNumber %= 100;
        }

        if (pnNumber > 0) {
            let _unitsMap = [
                "Zero", pbAmountUnit ? "" : "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
            ];
            let _tensMap = [
                "Zero", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
            ];

            if (pnNumber < 20) {
                _sb += _unitsMap[pnNumber];
            }
            else {
                _sb += _tensMap[Math.floor(pnNumber / 10)];
                if ((pnNumber % 10) > 0) {
                    _sb += '-';
                    _sb += _unitsMap[Math.floor(pnNumber % 10)];
                }
            }
        }

        return _sb.replace(/\s+/gi, " ");
    }

    private static spellNumberEn(pnNumber: number, pnDecimals: number = 0, pzDong?: string, pzXu?: string) {
        let _zDecimalStr = String.empty;

        let _strs = Math.abs(pnNumber).toString().split('.');
        if (pnDecimals > 0 && _strs.length > 0) {
            let _decimalMap = [
                "", "Tenth", "Hundredth",
                "Thousandth", "Ten-Thousandth", "Hundred-Thousandth",
                "Millionth", "Ten-Millionth", "Hundred-Millionth",
                "Billionth", "Ten-Billionth", "Hundred-Billionth",
                "Trillionth", "Ten-Trillionth", "Hundred-Trillionth",
                "Quadrillionth", "Ten-Quadrillionth", "Hundred-Quadrillionth"
            ];

            if (pzDong && pzXu && pnDecimals > 2)
                pnDecimals = 2;

            let _zd = _strs[1].substring(0, Math.min(_decimalMap.length, Math.min(_strs[1].length, pnDecimals)));
            var _nDecLen = _zd.trimEnd('0').length;
            if (pzDong && pzXu && _zd.length < 2)
                _zd = _zd.padEnd(2, '0');

            let _nDecimal = Number.asNumber(_zd);
            if (_nDecimal > 0) {
                if (_nDecimal >= 2 && pzXu) {
                    if (String.compare(pzXu, "penny") == 0)
                        pzXu = "pence";
                    else if (String.compare(pzXu, "cent") == 0)
                        pzXu += "s";
                }

                _zDecimalStr = this.numberToWords(_nDecimal);
                if (_zDecimalStr && pzXu) {
                    _zDecimalStr += " " + _decimalMap[_nDecLen];
                    if (_nDecimal > 1) _zDecimalStr += "s";
                }
            }
        }

        let _nInteger = Number.asNumber(_strs[0]);
        let _sb = this.numberToWords(_nInteger);
        if (pzDong) {
            _sb += ' ';
            _sb += pzDong;
            if (_nInteger >= 2) {
                if (String.compare(pzDong, "dollar") == 0 ||
                    String.compare(pzDong, "pound") == 0)
                    _sb += 's';
            }

            if (!_zDecimalStr)
                _sb += " only";
        }

        if (_zDecimalStr) {
            _sb += " and ";
            _sb += _zDecimalStr;

            if (pzXu) {
                _sb += ' ';
                _sb += pzXu;
            }
        }

        return _sb;
    }

    private static spellNumberVi(pnNumber: number, pnDecimals: number = 0, pzDong?: string, pzXu?: string,
        pbAmountUnit: boolean = false): string {
        let _zDecimalStr = String.empty;
        let _bIsNegative = Math.sign(pnNumber) < 0;

        let _strs = Math.abs(pnNumber).toString().split('.');
        if (pnDecimals > 0 && _strs.length > 1) {
            if (pzDong && pzXu && pnDecimals > 2)
                pnDecimals = 2;

            let _zd = _strs[1].substr(0, Math.min(_strs[1].length, pnDecimals));
            if (pzDong && pzXu && _zd.length < 2)
                _zd = _zd.padEnd(2, '0');

            let _nDecimal = Number.asNumber(_zd);
            if (_nDecimal > 0)
                _zDecimalStr = this.spellNumberVi(_nDecimal, 0);

        }

        let DON_VI = ["không", pbAmountUnit ? "" : "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        let HANG = ["", "nghìn", "triệu", "tỷ"];

        let _sb = String.empty;

        if (Number.asNumber(_strs[0]) == 0) {
            _sb += DON_VI[0];
        }
        else {
            let _i = _strs[0].length;
            if (_i == 0) {
                _sb = _sb.insert(0, DON_VI[0]);
            }
            else {
                let _j = 0;
                while (_i > 0) {
                    let _nDonvi = parseInt(_strs[0].substr(_i - 1, 1));

                    _i--;
                    let _nChuc: number = -1;
                    if (_i > 0)
                        _nChuc = parseInt(_strs[0].substr(_i - 1, 1));

                    _i--;
                    let _nTram = -1;
                    if (_i > 0)
                        _nTram = parseInt(_strs[0].substr(_i - 1, 1));

                    _i--;
                    if ((_nDonvi > 0) || (_nChuc > 0) || (_nTram > 0) || (_j == 3))
                        _sb = _sb.insert(0, HANG[_j]);

                    _j++;
                    if (_j > 3) _j = 1; //Tránh lỗi, nếu dưới 13 số thì không có vấn đề.
                    //Hàm này chỉ dùng để đọc đến 9 số nên không phải bận tâm
                    if ((_nDonvi == 1) && (_nChuc > 1)) {
                        _sb = _sb.insert(0, "mốt ");
                    }
                    else {
                        if ((_nDonvi == 5) && (_nChuc > 0))
                            _sb = _sb.insert(0, "lăm ");
                        else if (_nDonvi > 0)
                            _sb = _sb.insert(0, DON_VI[_nDonvi] + " ");
                    }

                    if (_nChuc < 0) {
                        break;//Hết số
                    }
                    else {
                        if ((_nChuc == 0) && (_nDonvi > 0))
                            _sb = _sb.insert(0, "linh ");

                        if (_nChuc == 1)
                            _sb = _sb.insert(0, "mười ");

                        if (_nChuc > 1)
                            _sb = _sb.insert(0, DON_VI[_nChuc] + " mươi ");
                    }

                    if (_nTram < 0) {
                        break;//Hết số
                    }
                    else {
                        if ((_nTram > 0) || (_nChuc > 0) || (_nDonvi > 0))
                            _sb = _sb.insert(0, DON_VI[_nTram] + " trăm ");
                    }

                    _sb = _sb.insert(0, ' ');
                }
            }
        }

        if (_bIsNegative)
            _sb.insert(0, "âm ");

        let _z = _sb.trim().replace(/\s+/gi, " ").replace(
            "linh bốn", "linh tư").replace("mươi bốn", "mươi tư");
        _sb = _z;

        if (pzDong) {
            _sb = _sb.concat(' ', pzDong[0].toLowerCase(), pzDong.substr(1));
            if (!_zDecimalStr)
                _sb += " chẵn";
        }

        if (_zDecimalStr) {
            _sb += ' ';
            if (!pzDong && !pzXu)
                _sb += "phẩy ";

            _sb += _zDecimalStr.toLowerCase();

            if (pzXu) _sb = _sb.concat(' ', pzXu[0].toLowerCase(), pzXu.substr(1));
        }

        _sb = _sb[0].toUpperCase().concat(_sb.substr(1));
        return _sb;
    }

    /**
     * Get unevaluate argument expression
     * @param expression 
     */
    private static getArgumentExpressions(expression: BravoExpression): BravoExpression[] {
        let list = new Array<BravoExpression>();

        if (expression.Operator == OperatorEnum.Arguments)
            this.loadArgumentExpression(expression, list);
        else if (expression != BravoExpression.Empty)
            list.push(expression);

        return list;
    }

    /**
     * Get unevaluate argument expression
     * @param expression 
     * @param list 
     */
    private static loadArgumentExpression(expression: BravoExpression, list: BravoExpression[]) {
        if (expression.Operator != OperatorEnum.Arguments)
            throw new Error('InvalidOperationException');

        if (expression.Expressions[0].Operator != OperatorEnum.Arguments)
            list.push(expression.Expressions[0]);
        else if (expression != BravoExpression.Empty)
            this.loadArgumentExpression(expression.Expressions[0], list);

        list.push(expression.Expressions[1]);
    }

    private static getMemberAccessExpressions(expression: BravoExpression): Array<BravoExpression> {
        let _list = new Array<BravoExpression>();

        if (expression.Operator == OperatorEnum.MemberAccess)
            this.loadMemberAccessExpression(expression, _list);
        else if (expression != BravoExpression.Empty)
            _list.push(expression);

        return _list;
    }

    private static loadMemberAccessExpression(expression: BravoExpression, list: Array<BravoExpression>) {
        if (expression.Operator != OperatorEnum.MemberAccess)
            throw new Error('InvalidOperationException');

        if (expression.Expressions[0].Operator != OperatorEnum.MemberAccess)
            list.push(expression.Expressions[0]);
        else if (expression != BravoExpression.Empty)
            this.loadMemberAccessExpression(expression.Expressions[0], list);

        list.push(expression.Expressions[1]);
    }

    //#endregion static members

    public readonly onParameterValueRequired = new Event();
    public readonly onParentRowRequired = new Event();

    public readonly dataRowRequired = new Event();
    public onDataRowRequired(e?: ParameterValueEventArgs) {
        this.dataRowRequired.raise(this, e);
    }

    public readonly onLocalValueRequired = new Event();
    public readonly onDefaultValueRequired = new Event();

    private _evaluatingObject: any = {};
    private _evaluatingDataRow: WebDataRow = null;

    private _aggregateCalculating: boolean = false;

    constructor() {
    }

    /**
     * Enable tracing values while evaluating expression.
     */
    public bEnableTracing: boolean = false;

    private _tracer: string = null;

    /**
     * Return tracing values while evaluating expression.
     */
    public get tracer(): string {
        if (this._tracer == null)
            this._tracer = String.empty;

        return this._tracer;
    }

    private _variables: Dictionary<string, object> = null;

    /**
     * Declare variables.
     */
    public get variables(): Dictionary<string, object> {
        if (!this._variables)
            this._variables = new Dictionary<string, object>();

        return this._variables;
    }

    public isTrue(pzExpression: string, pDataItem: any) {
        return true === this.evaluate(pzExpression, pDataItem);
    }

    /**
     * Evaluate any expression in format {=expr} existing in an indicated string
     * @param pzText 
     * @param pDataItem object || WebDataRow
     */
    public evaluateText(pzText: string, pDataItem: any = null) {
        return this.internalEvaluateText(pzText, pDataItem, true, false);
    }

    /**
     * Evaluate any expression in format {=expr} existing in an indicated string
     * @param pzText 
     * @param pDataItem object || WebDataRow
     */
    public evaluateRtfText(pzText: string, pDataItem: any = null) {
        return this.internalEvaluateText(pzText, pDataItem, true, true);
    }

    public zEvaluateTextErrorValue: string = null;

    /**
     * Evaluate any expression in format {=expr} existing in an indicated string
     * @param pzText 
     * @param pDataItem 
     * @param pbClearTracing 
     * @param pbRtfFormat 
     */
    private internalEvaluateText(pzText: string, pDataItem: any, pbClearTracing: boolean, pbRtfFormat: boolean = false) {
        if (pbClearTracing) {
            if (this.tracer.length > 0)
                this._tracer = String.empty;
        }

        if (!pzText)
            return String.empty;

        if (!pzText.includes("{=") && !pzText.includes("}"))
            return pzText;

        let _bDebug = false;
        if (pbClearTracing && BravoDebug.isDebugExpression(pzText)) {
            _bDebug = true;
            if (!this.bEnableTracing) this.bEnableTracing = true;
        }

        try {
            let _zResult = pzText.replace(pbRtfFormat ? RtfExprPattern : ExprPattern, (match, zExpr) => {
                let _zLastValue = this.zEvaluateTextErrorValue;

                try {
                    let _returnValue: any;

                    let _exprs = BravoExpression.create(zExpr);

                    _returnValue = this.evaluateCollection(_exprs, pDataItem);

                    if (_returnValue == null || _returnValue == undefined)
                        throw new Error('Aggurent null ' + zExpr);

                    if (pbRtfFormat) {
                        if (match && match.startsWith('\\'))
                            return BravoExpressionEvaluator.escapeRtfUnicode(String.format("\\*{0}", _returnValue));
                        else
                            return BravoExpressionEvaluator.escapeRtfUnicode(String.format("{0}", _returnValue));
                    }

                    return `${_returnValue}`;
                }
                catch (_ex) {
                    if (_zLastValue != null)
                        return _zLastValue;

                    throw new Error('InvalidExpressionException');
                }
                finally {
                    this.zEvaluateTextErrorValue = _zLastValue;
                }
            });

            return _zResult;
        }
        finally {
            if (this._variables)
                this._variables.clear();

            if (_bDebug)
                console.log(String.format("<<<DEBUG EXPRESSION>>> {0}\n{1}", pzText, this.tracer));
        }
    }

    public evaluate(pzExpression: string, pDataItem?: any) {
        if (this.tracer.length > 0)
            this._tracer = String.empty;

        if (!pzExpression)
            return null;

        if (String.compare(pzExpression, Boolean.trueString, SensitivityEnum.Base) == 0)
            return true;
        else if (String.compare(pzExpression, Boolean.falseString, SensitivityEnum.Base) == 0)
            return false;

        let _bDebug = false;
        if (BravoDebug.isDebugExpression(pzExpression)) {
            _bDebug = true;
            if (!this.bEnableTracing) this.bEnableTracing = true;
        }

        try {
            pzExpression = this.internalEvaluateText(pzExpression, pDataItem, false, false);

            if (pzExpression.startsWith('{=') && pzExpression.endsWith('}'))
                pzExpression = pzExpression.substr(2, pzExpression.length - 3);

            if (String.compare(pzExpression, Boolean.trueString, SensitivityEnum.Base) == 0)
                return true;
            else if (String.compare(pzExpression, Boolean.falseString, SensitivityEnum.Base) == 0)
                return false;

            return this.evaluateCollection(BravoExpression.create(pzExpression), pDataItem);
        }
        catch (_ex) {
            throw _ex;
        }
        finally {
            if (_bDebug)
                console.log(String.format("<<<DEBUG EXPRESSION>>> {0}\n{1}", pzExpression, this.tracer));
        }
    }

    private evaluateCollection(expressions: BravoExpression[], pDataItem: any = null) {
        let _lastObject = this._evaluatingObject;
        let _lastDataRow = this._evaluatingDataRow;

        this._evaluatingDataRow = pDataItem instanceof WebDataRow ? pDataItem : null;
        if (!this._evaluatingDataRow) {

        }

        if (!this._evaluatingDataRow && !pDataItem && this.dataRowRequired != null) {
            let _e = new ParameterValueEventArgs(null);
            this.onDataRowRequired(_e);
            this._evaluatingDataRow = _e.value;
        }

        if (!this._evaluatingDataRow && pDataItem)
            this._evaluatingObject = pDataItem;
        else
            this._evaluatingObject = null;

        let _returnValue: any = null;

        try {
            for (const _e of expressions)
                _returnValue = this.evaluateExpression(_e);

            return _returnValue;
        }
        finally {
            if (this._variables != null)
                this._variables.clear();

            this._evaluatingObject = _lastObject;
            this._evaluatingDataRow = _lastDataRow;
        }
    }

    /**
     * Evaluate the expression
     * @param expression 
     */
    public evaluateExpression(expression: BravoExpression): any {
        if (expression == BravoExpression.Empty)
            return String.empty;

        if (expression.Operator == OperatorEnum.Unknown)
            return String.empty;

        // Aggregate expression
        if (BravoExpression.isAggregateFunction(expression.Operator)) {
            if (this._aggregateCalculating)
                throw new Error('Cannot recursive perform aggregate functions.');

            return this.evaluateAggregateExpression(expression);
        }

        switch (expression.Operator) {
            case OperatorEnum.Declare: {
                let _var = String.format("{0}", expression.Expressions[0].Value);
                let _val = expression.Expressions[1];

                if (this.variables.containsKey(_var))
                    throw new Error(String.format("The variable name '{0}' has been already declared.", _var));

                this.variables.add(_var, this.evaluateExpression(_val));
                return this.variables.get(_var);
            }
            case OperatorEnum.Set: {
                let _var = String.format("{0}", expression.Expressions[0].Value);
                let _val = expression.Expressions[1];

                if (!this.variables.containsKey(_var))
                    throw new Error(String.format("Must declare the local variable '{0}'.", _var));

                this.variables.set(_var, _val);
                return this.variables.get(_var);
            }
            case OperatorEnum.Value: {
                return this.evaluateValueExpression(expression);
            }
            case OperatorEnum.Vlookup: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length < 2 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (!this._evaluatingDataRow) {
                    let _valueArgs = new ValueEventArgs(expression.Operator, _args);
                    this.onDefaultValueRequired.raise(this, _valueArgs);
                    return _valueArgs.value;
                }

                let _options: { pzSourceDataName: string };
                let _obj = this.evaluateSourceDataExpression(expression, _options);
                let _rows = BravoExpressionEvaluator.getAggregateSource(_obj);

                for (const _row of _rows) {
                    if (_args.length < 3)
                        return this.evaluateCollection([_args[1]], _row);

                    if (BravoExpressionEvaluator.isTrueValue(this.evaluateCollection([_args[2]], _row)))
                        return this.evaluateCollection([_args[1]], _row);
                }

                return null;
            }
            case OperatorEnum.Exists: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length < 1 || _args.length > 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                let _options: { pzSourceDataName: string };
                let _obj = this.evaluateSourceDataExpression(expression, _options);
                let _rows = BravoExpressionEvaluator.getAggregateSource(_obj);

                for (const _row of _rows)
                    if (BravoExpressionEvaluator.isTrueValue(this.evaluateCollection([_args[1]], _row)))
                        return true;

                return false;
            }
            case OperatorEnum.MemberAccess: {
                let _member = BravoExpressionEvaluator.convert<string>(expression.Expressions[1].Value, TypeCode.String);
                let _options: { pzSourceDataName: string };
                let _obj = this.evaluateSourceDataExpression(expression, _options);

                if (_obj instanceof WebDataRow)
                    return this.evaluateDataRow(_obj, _member);

                if (_obj instanceof Object)
                    return this.evaluateObject(_obj, _member);

                if (!_obj) throw new Error("Value cannot be null");
            }
            case OperatorEnum.Between: {
                let bwlhs = this.evaluateExpression(expression.Expressions[0]);
                let bwrhs = expression.Expressions[1];

                if (bwrhs.Operator != OperatorEnum.And)
                    throw new SyntaxError();

                let bwfrom = this.evaluateExpression(bwrhs.Expressions[0]);
                if (BravoExpressionEvaluator.compare(bwlhs, bwfrom) < 0)
                    return false;

                let bwto = this.evaluateExpression(bwrhs.Expressions[1]);
                return BravoExpressionEvaluator.compare(bwlhs, bwto) <= 0;
            }
            case OperatorEnum.Is: {
                let _islhs = this.evaluateExpression(expression.Expressions[0]);
                let _isrhs = expression.Expressions[1];
                if (_isrhs.Operator == OperatorEnum.Value) {
                    if (String.compare(_isrhs.Value, "null") != 0)
                        throw new Error("Syntax error...");

                    return _islhs == null || _islhs == undefined ? true : false;
                }
                else {
                    throw new Error("Syntax error...");
                }
            }
            case OperatorEnum.RowState: {
                return this._evaluatingDataRow ? DataRowState[this._evaluatingDataRow.rowState] : null;
            }
            case OperatorEnum.CurrentValue:
            case OperatorEnum.UpdatedColumn:
            case OperatorEnum.ColumnName:
            case OperatorEnum.TableName:
            case OperatorEnum.Text:
            case OperatorEnum.LastCommand:
            case OperatorEnum.LayoutName:
            case OperatorEnum.LayoutId:
            case OperatorEnum.FormCommandName: {
                if (!this.onLocalValueRequired.hasHandlers)
                    throw new Error(String.format(MessageContstants.InvalidOperationError,
                        OperatorEnum[expression.Operator].toUpperCase()));

                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                let _nMaxArg = 0;
                if (expression.Operator == OperatorEnum.Text)
                    _nMaxArg = 1;
                else if (expression.Operator == OperatorEnum.CurrentValue)
                    _nMaxArg = 2;
                else if (expression.Operator == OperatorEnum.FormCommandName)
                    _nMaxArg = 1;

                if (_args.length > _nMaxArg)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), _nMaxArg));

                let _arr = new Array<any>();
                for (let _expr of _args)
                    _arr.push(_expr.Value);

                let _e = new ValueEventArgs(expression.Operator, _arr);
                this.onLocalValueRequired.raise(this, _e);
                return _e.value;
            }
            case OperatorEnum.OsMachineName: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length > 0)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 0));

                return "<NOT SUPPORT>";
            }
            case OperatorEnum.OsDomainName: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length > 0)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 0));

                return "<NOT SUPPORT>";
            }
            case OperatorEnum.OsUserName: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length > 0)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 0));

                return "<NOT SUPPORT>";
            }
            case OperatorEnum.LangId: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args && _args.length > 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                if (_args.length < 1) return BravoClientSettings.nCurrentLangId;

                let _zLangKey = String.format("{0}", this.evaluateExpression(_args[0]));
                if (!BravoLangEnum[_zLangKey])
                    throw new Error(String.format("Unknown language '{0}'.", _zLangKey));

                let _culs = BravoCulture.getLangCollection();
                if (!_culs) return -1;

                return _culs.indexOf(parseInt(_zLangKey));
            }
            case OperatorEnum.LangName: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length > 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                if (_args.length < 1) return BravoLangEnum.Vietnamese;
                let _coll = BravoCulture.getLangCollection();
                let _nLangId = Number.asNumber(this.evaluateExpression(_args[0]));
                if (_nLangId < 0 || _nLangId >= _coll.length)
                    throw new Error(String.format(MessageContstants.UnknownLanguage, _nLangId));

                return _coll[_nLangId].toString();
            }
            case OperatorEnum.System:
            case OperatorEnum.Config:
            case OperatorEnum.Currency:
            case OperatorEnum.User:
            case OperatorEnum.Branch:
            case OperatorEnum.BranchFilter:
            case OperatorEnum.FiscalYear:
            case OperatorEnum.SignatureText:
            case OperatorEnum.SignatureImage:
            case OperatorEnum.FormatCurrency:
            case OperatorEnum.FormatQuantity:
            case OperatorEnum.FormatDateRange:
            case OperatorEnum.ServerName:
            case OperatorEnum.DatabaseName:
            case OperatorEnum.VerifyChecksum:
            case OperatorEnum.IsFiscalDate:
            case OperatorEnum.IsSpecialDate:
            case OperatorEnum.StartDateOfYear:
            case OperatorEnum.SOYear:
            case OperatorEnum.EndDateOfYear:
            case OperatorEnum.EOYear:
            case OperatorEnum.StartDateOfQuarter:
            case OperatorEnum.SOQuarter:
            case OperatorEnum.EndDateOfQuarter:
            case OperatorEnum.EOQuarter:
            case OperatorEnum.NameByLang: {
                if (!BravoExpressionEvaluator.onValueRequired.hasHandlers)
                    throw new Error(String.format(MessageContstants.InvalidOperationError,
                        OperatorEnum[expression.Operator].toUpperCase()));

                let _nMinArg = 1;
                if (expression.Operator == OperatorEnum.User ||
                    expression.Operator == OperatorEnum.Branch ||
                    expression.Operator == OperatorEnum.FiscalYear ||
                    expression.Operator == OperatorEnum.ServerName ||
                    expression.Operator == OperatorEnum.DatabaseName ||
                    expression.Operator == OperatorEnum.FormatCurrency ||
                    expression.Operator == OperatorEnum.FormatQuantity)
                    _nMinArg = 0;
                else if (expression.Operator == OperatorEnum.FormatDateRange)
                    _nMinArg = 2;

                let _nMaxArg = 1;
                if (expression.Operator == OperatorEnum.SignatureImage || expression.Operator == OperatorEnum.SignatureText)
                    _nMaxArg = 2;
                else if (expression.Operator == OperatorEnum.FormatDateRange)
                    _nMaxArg = 4;

                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length < _nMinArg || _args.length > _nMaxArg)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), _nMinArg));

                var _arr = new Array<any>();
                for (let _expr of _args)
                    _arr.push(this.evaluateExpression(_expr));

                var _e = new ValueEventArgs(expression.Operator, _arr);
                BravoExpressionEvaluator.onValueRequired.raise(this, _e);
                return _e.value;
            }
            case OperatorEnum.TokenRawData: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args.length > 0)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 0));

                return "<NOT SUPPORT>";
            }
            case OperatorEnum.TokenSignData: {
                return "<NOT SUPPORT>";
            }
            case OperatorEnum.HashValue: {

            }
            case OperatorEnum.Encrypt:
            case OperatorEnum.Decrypt: {

            }
            case OperatorEnum.DatePart: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args == null || _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                let _zDatePart = `${_args[0].Value}`;
                let _dp = DatePartEnum[_zDatePart];
                if (_dp == null || _dp == undefined)
                    throw new Error(String.format(MessageContstants.UnknownDatePart, _zDatePart));

                if (BravoExpressionEvaluator.onValueRequired.hasHandlers && (_dp == DatePartEnum.q ||
                    _dp == DatePartEnum.qq || _dp == DatePartEnum.quarter)) {
                    let _dt = <Date>BravoDataTypeConverter.convertValue(this.evaluateExpression(_args[1]), TypeCode.DateTime);
                    let _e = new ValueEventArgs(OperatorEnum.Quarter, [_dt]);
                    BravoExpressionEvaluator.onValueRequired.raise(this, _e);

                    if (_e.value)
                        return _e.value;
                }

                return BravoExpressionEvaluator.datePart(_dp, this.evaluateExpression(_args[1]));
            }
            case OperatorEnum.StartDateOfMonth:
            case OperatorEnum.SOMonth:
            case OperatorEnum.EndDateOfMonth:
            case OperatorEnum.EOMonth: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _val = this.evaluateExpression(_args[0]);
                let _dtValue: Date = Date.asDate(_val);
                let _nMonth = 0, _nYear = 0;
                if (_dtValue instanceof Date) {
                    _nMonth = _dtValue.month();
                    _nYear = _dtValue.year();
                }
                else {
                    _nMonth = BravoExpressionEvaluator.convert<number>(_args[0], TypeCode.Int32);
                    _nYear = this.getCurrentDateTime(OperatorEnum.GetDate).year();
                }

                if (expression.Operator == OperatorEnum.EndDateOfMonth ||
                    expression.Operator == OperatorEnum.EOMonth) {
                    if (_nMonth == 12) {
                        _nMonth = 1;
                        _nYear += 1;
                    }
                    else {
                        _nMonth++;
                    }
                }

                let _dt = new Date(Date.UTC(Date.year, _nMonth - 1, 1));
                if (expression.Operator == OperatorEnum.EndDateOfMonth ||
                    expression.Operator == OperatorEnum.EOMonth)
                    _dt.setDate(_dt.getDate() - 1);

                return _dt.date();
            }
            case OperatorEnum.DateAdd: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _zDatePart = String.asString(_args[0].Value);
                let _dp = DatePartEnum[_zDatePart];
                if (_dp == null || _dp == undefined)
                    throw new Error(String.format(MessageContstants.UnknownDatePart, _zDatePart));

                return BravoExpressionEvaluator.dateAdd(_dp,
                    BravoExpressionEvaluator.convert<number>(this.evaluateExpression(_args[1]), TypeCode.Int32),
                    this.evaluateExpression(_args[2]));
            }
            case OperatorEnum.DateDiff: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _zDatePart = String.asString(_args[0].Value);
                let _dp = DatePartEnum[_zDatePart];
                if (_dp == null || _dp == undefined)
                    throw new Error(String.format(MessageContstants.UnknownDatePart, _zDatePart));

                return BravoExpressionEvaluator.dateDiff(_dp,
                    BravoExpressionEvaluator.convert<number>(this.evaluateExpression(_args[1]), TypeCode.Int32),
                    this.evaluateExpression(_args[2]));
            }
            case OperatorEnum.Format: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (_args == null || _args.length < 1 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _zFormat = String.empty;
                if (_args.length >= 2)
                    _zFormat = this.getFormat(String.format("{0}", this.evaluateExpression(_args[1])));

                let _val = this.evaluateExpression(_args[0]);

                if (String.isNullOrEmpty(_zFormat)) {
                    if (Date.isDate(_val)) {
                        _zFormat = String.format("{0}", this.evaluate("CONFIG('M_DefaultDateFormat')"));
                        if (!_zFormat) _zFormat = "d";
                    } else if (Number.isNumber(_val)) {
                        _zFormat = String.format("{0}", this.evaluate("CONFIG('M_DefaultNumberFormat')"));
                        if (_zFormat) _zFormat = "G";
                    }
                }

                /* if (_args.length == 3) {
                    let _zLang = String.format("{0}", this.evaluateExpression(_args[2]));
                } */

                return Globalize.format(_val, _zFormat);
            }
            case OperatorEnum.Iif: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _val_0 = this.evaluateExpression(_args[0]);
                if (BravoExpressionEvaluator.isTrueValue(_val_0))
                    return this.evaluateExpression(_args[1]);

                return this.evaluateExpression(_args[2]);
            }
            case OperatorEnum.Case: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length < 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _nCase = 0;
                let _val_0 = this.evaluateExpression(_args[0]);

                if (_val_0 != null && _val_0 != undefined)
                    _nCase = BravoExpressionEvaluator.convert<number>(_val_0, TypeCode.Int32);

                _nCase += 1;

                if (_nCase < 1 || _nCase >= _args.length)
                    throw new Error("ArgumentOutOfRangeException: " + OperatorEnum[expression.Operator]);

                return this.evaluateExpression(_args[_nCase]);
            }
            case OperatorEnum.IsNull: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                let _val = this.evaluateExpression(_args[0]);
                if (_val != null && _val != undefined) return _val;

                return this.evaluateExpression(_args[1]);
            }
            case OperatorEnum.Coalesce: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length < 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                for (const _arg of _args) {
                    let _value = this.evaluateExpression(_arg);

                    if (_value == null || _value == undefined)
                        continue;

                    if (Number.isNumber(_value) && _value == 0)
                        continue;

                    if (Date.isDate(_value) && _value == BravoExpressionEvaluator.EmptyDate)
                        continue;

                    if (isString(_value) && !String.asString(_value))
                        continue;

                    return _value;
                }

                return null;
            }
            case OperatorEnum.IsInteger: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                let _val = this.evaluateExpression(_args[0]);
                return _val != null && _val != undefined && Number.isInteger(_val);
            }
            case OperatorEnum.IsNumeric: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                let _val = this.evaluateExpression(_args[0]);
                return _val != null && _val != undefined && Number.isNumber(_val);
            }
            case OperatorEnum.IsDatetime: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
                if (!_args || _args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                let _val = this.evaluateExpression(_args[0]);
                return Date.isDate(_val);
            }
        }

        let lhs: any = null, rhs: any = null;
        lhs = this.evaluateExpression(expression.Expressions[0]);

        switch (expression.Operator) {
            case OperatorEnum.And: {
                if (!BravoExpressionEvaluator.isTrueValue(lhs))
                    return false;

                rhs = this.evaluateExpression(expression.Expressions[1]);
                return BravoExpressionEvaluator.isTrueValue(rhs);
            }
            case OperatorEnum.Or: {
                if (BravoExpressionEvaluator.isTrueValue(lhs))
                    return true

                rhs = this.evaluateExpression(expression.Expressions[1]);
                return BravoExpressionEvaluator.isTrueValue(rhs);
            }
            case OperatorEnum.In: {
                let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[1]);
                for (const _arg of _args) {
                    if (lhs === this.evaluateExpression(_arg)) {
                        return true;
                    }
                }

                return false;
            }
        }

        let type = BravoExpression.getOperatorType(expression.Operator);
        if (type == OperatorTypeEnum.Binary)
            rhs = this.evaluateExpression(expression.Expressions[1]);

        switch (expression.Operator) {
            case OperatorEnum.Addition: {
                return BravoExpressionEvaluator.addition(lhs, rhs);
            }
            case OperatorEnum.Subtraction: {
                return BravoExpressionEvaluator.subtraction(lhs, rhs);
            }
            case OperatorEnum.Multiplication: {
                return BravoExpressionEvaluator.multiplication(lhs, rhs);
            }
            case OperatorEnum.Division: {
                return BravoExpressionEvaluator.division(lhs, rhs);
            }
            case OperatorEnum.Arguments: {
                let _lst: Array<any> = [];
                let _args = lhs instanceof Array ? lhs : null;
                if (_args)
                    _lst.push(..._args);
                else
                    _lst.push(lhs);

                _args = rhs instanceof Array ? rhs : null;
                if (_args)
                    _lst.push(..._args);
                else
                    _lst.push(rhs);

                return _lst;
            }
            case OperatorEnum.Modulus: {
                return BravoExpressionEvaluator.modulus(lhs, rhs);
            }
            case OperatorEnum.GreaterThan: {
                return BravoExpressionEvaluator.compare(lhs, rhs) > 0;
            }
            case OperatorEnum.LessThan: {
                return BravoExpressionEvaluator.compare(lhs, rhs) < 0;
            }
            case OperatorEnum.Equal:
            case OperatorEnum.Equality: {
                return BravoExpressionEvaluator.compare(lhs, rhs) == 0;
            }
            case OperatorEnum.Notequal:
            case OperatorEnum.Inequality: {
                return eval('lhs !== rhs');
            }
            case OperatorEnum.GreaterThanOrEqual: {
                return BravoExpressionEvaluator.compare(lhs, rhs) >= 0;
            }
            case OperatorEnum.LessThanOrEqual: {
                return BravoExpressionEvaluator.compare(lhs, rhs) <= 0;
            }
            case OperatorEnum.Like: {
                return BravoExpressionEvaluator.like(rhs, lhs);
            }
            case OperatorEnum.UnaryPlus: {
                return lhs;
            }
            case OperatorEnum.UnaryNegation: {
                return BravoExpressionEvaluator.multiplication(-1, lhs);
            }
            case OperatorEnum.LogicalNot:
            case OperatorEnum.Not: {
                return !BravoExpressionEvaluator.isTrueValue(lhs);
            }
            case OperatorEnum.Eval: {
                let _args = lhs as Array<any>;
                if (!_args && _args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                if (lhs == null || lhs == undefined)
                    return lhs;

                return this.evaluateCollection(BravoExpression.create(lhs), this._evaluatingDataRow);
            }
            case OperatorEnum.Convert: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args == null || _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                var _zTypeCode = BravoExpressionEvaluator.convert<string>(_args[1], TypeCode.String);

                if (_zTypeCode.startsWith("System."))
                    _zTypeCode = _zTypeCode.substring("System.".length);

                let _typeCode = TypeCode[_zTypeCode];
                return BravoDataTypeConverter.convertValue(_args[0], _typeCode);
            }
            case OperatorEnum.Empty: {
                if (lhs == null || lhs == undefined)
                    return true;

                if (Number.isNumber(lhs))
                    return BravoDataTypeConverter.compareValue(0,
                        BravoExpressionEvaluator.convert<number>(lhs, TypeCode.Decimal), TypeCode.Decimal);

                if (Date.isDate(lhs))
                    return BravoExpressionEvaluator.convert<Date>(lhs, TypeCode.DateTime) == BravoExpressionEvaluator.EmptyDate;

                if (isString(lhs))
                    return !lhs;

                if (isBoolean(lhs))
                    return false === BravoExpressionEvaluator.convert<boolean>(lhs, TypeCode.Boolean);

                return false;
            }
            case OperatorEnum.Sqr: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.sqrt(Number.asNumber(lhs));
            }
            case OperatorEnum.Abs: {
                return Math.abs(Number.asNumber(lhs));
            }
            case OperatorEnum.Sin: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.sin(Number.asNumber(lhs));
            }
            case OperatorEnum.Cosin: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.cos(Number.asNumber(lhs));
            }
            case OperatorEnum.Round: {
                let _args = lhs as Array<any>;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                return Number.asNumber(_args[0]).round(Number.asNumber(_args[1]));
            }
            case OperatorEnum.RoundUp: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return Math.ceil(Number.asNumber(_args[0]) * Math.pow(10,
                    Number.asNumber(_args[1])) / Math.pow(10, Number.asNumber(_args[1])));
            }
            case OperatorEnum.RoundDown: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return Math.floor(Number.asNumber(_args[0]) * Math.pow(10,
                    Number.asNumber(_args[1])) / Math.pow(10, Number.asNumber(_args[1])));
            }
            case OperatorEnum.Ceiling: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.ceil(Number.asNumber(lhs));
            }
            case OperatorEnum.Floor: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.floor(Number.asNumber(lhs));
            }
            case OperatorEnum.Pow: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return Math.pow(Number.asNumber(_args[0]), Number.asNumber(_args[1]));
            }
            case OperatorEnum.MaxOf:
            case OperatorEnum.MinOf: {
                return;
            }
            case OperatorEnum.Left: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return String.asString(_args[0]).left(Number.asNumber(_args[1]));
            }
            case OperatorEnum.Right: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return String.asString(_args[0]).right(Number.asNumber(_args[1]));
            }
            case OperatorEnum.PadL:
            case OperatorEnum.PadLeft: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length < 1 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                let _zStr = String.asString(_args[0]);
                let _nLen = Number.asNumber(_args[1]);

                if (_args.length == 3) {
                    let _pc = String.asString(_args[2]);
                    if (_pc && _pc.length > 0) {
                        return _zStr.padStart(_nLen, _pc[0]);
                    }
                }

                return _zStr.padStart(_nLen);
            }
            case OperatorEnum.PadR:
            case OperatorEnum.PadRight: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args && _args.length < 1 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                let _zStr = String.asString(_args[0]);
                let _nLen = Number.asNumber(_args[1]);

                if (_args.length == 3) {
                    let _pc = String.asString(_args[2]);
                    if (_pc && _pc.length > 0) {
                        return _zStr.padEnd(_nLen, _pc[0]);
                    }
                }

                return _zStr.padEnd(_nLen);
            }
            case OperatorEnum.SubStr:
            case OperatorEnum.SubString: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args || _args.length < 2 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), '2 or 3'));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                let _zStr = String.asString(_args[0]);
                if (!_zStr) return String.empty;

                let _nStart = Number.asNumber(_args[1]);
                if (_nStart < 0 || _nStart >= _zStr.length)
                    return String.empty;

                if (_args.length == 3) {
                    let _nLen = Number.asNumber(_args[2]);

                    if (_nLen < 1)
                        return String.empty;

                    if (_nStart + _nLen < _zStr.length)
                        return _zStr.substr(_nStart, _nLen);
                }

                return _zStr.substr(_nStart);
            }
            case OperatorEnum.CharIndex: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args || _args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2))

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                if (_args[1] == null || _args[1] == undefined)
                    return _args[1];

                return String.asString(_args[0]).indexOf(_args[1]);
            }
            case OperatorEnum.Replace: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args || _args.length < 2 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _zReplaceStr = String.empty;
                if (_args.length == 3)
                    _zReplaceStr = String.asString(_args[2]);

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                return String.asString(_args[0]).replace(_args[1], _zReplaceStr);
            }
            case OperatorEnum.Stuff: {
                let _args = lhs instanceof Array ? lhs : null;
                if (!_args || _args.length != 4)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 4));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                return String.asString(_args[0]).stuff(_args[1], _args[2], _args[3]);
            }
            case OperatorEnum.Len: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).length;
            }
            case OperatorEnum.Trim: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).trim();
            }
            case OperatorEnum.Ltrim: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).trimStart();
            }
            case OperatorEnum.Rtrim: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).trimEnd();
            }
            case OperatorEnum.Str: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args == null) {
                    _args = new Array(1);
                    _args[0] = lhs;
                }

                if (lhs == null || _args.length < 1 || _args.length > 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                let _nLength: number = 10, _nDecimal: number = 0;

                if (_args.length >= 2)
                    _nLength = Number.asNumber(_args[1]);

                if (_args.length >= 3)
                    _nDecimal = Number.asNumber(_args[2]);

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                let _bytes = _args[0] instanceof Array ? _args[0] : null;
                if (_bytes) {
                    try {
                        return "<STRING BASE64>";
                    }
                    catch {
                        return _bytes.toString();
                    }
                }

                let _nNum = Number.asNumber(_args[0]);
                return _nNum.str(_nLength, _nDecimal);
            }
            case OperatorEnum.Upper: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).toUpperCase();
            }
            case OperatorEnum.Lower: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).toLowerCase();
            }
            case OperatorEnum.RemoveAccent: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return String.asString(lhs).removeAccent();
            }
            case OperatorEnum.SpellNumber: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args == null) {
                    if (lhs == null || !lhs.toString().Trim())
                        return String.empty;

                    return BravoExpressionEvaluator.spellNumber(Number.asNumber(lhs),
                        BravoClientSettings.currentLang);
                }

                if (_args.length < 1 || _args.length > 4)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 4));

                if (_args[0] == null || !_args[0].toString().trim())
                    return String.empty;

                let _nDec = Number.asNumber(_args[0]);
                _args[0] = _nDec;

                let _lang = BravoClientSettings.currentLang;
                if (_args.length > 2) {
                    let _zLang = _args[2] == null || _args[2] == undefined ? String.empty : String.asString(_args[2]);
                    if (_zLang) {
                        _lang = BravoLangEnum[_zLang];
                        if (BravoLangEnum[_zLang])
                            throw new Error(String.format(MessageContstants.UnknownLanguage, _zLang));
                    }
                }

                let _nDecimals = 0;
                if (_args.length > 3 && _args[3] != null && _args[3] != undefined)
                    _nDecimals = Number.asNumber(_args[3]);

                if (_args.length > 1) {
                    let _zCurrency = _args[1] == null || _args[1] == undefined ? String.empty : String.asString(_args[1]);
                    if (_zCurrency) {
                        if (!BravoExpressionEvaluator.onValueRequired.hasHandlers)
                            throw new Error("InvalidOperationException" + OperatorEnum[expression.Operator]);

                        if (_args.length < 3)
                            _args.push(_lang);
                        else
                            _args[2] = _lang;

                        if (_args.length > 3)
                            _args[3] = _nDecimals;

                        let _e = new ValueEventArgs(expression.Operator, _args);
                        BravoExpressionEvaluator.onValueRequired.raise(this, _e);
                        return _e.value;
                    }
                }

                return BravoExpressionEvaluator.spellNumber(_nDec, _lang, _nDecimals);
            }
            case OperatorEnum.RegexMatch: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                let _text = String.asString(_args[0]);
                if (!_text) return _text;

                let _rgx = new RegExp(_args[1]);
                return _rgx.test(String.asString(_args[0]));
            }
            case OperatorEnum.RegexReplace: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args.length != 3)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 3));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                let _text = String.asString(_args[0]);
                if (!_text) return _text;

                return _text.replace(new RegExp(_args[1]), String.asString(_args[2]));
            }
            case OperatorEnum.RegexExtract: {
                let _args = lhs instanceof Array ? lhs : null;
                if (_args.length != 2)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 2));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                let _text = String.asString(_args[0]);
                if (!_text) return _text;

                return _text.match(new RegExp(_args[1])).values.toString();
            }
            case OperatorEnum.Day: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).day();
            }
            case OperatorEnum.Month: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).month();
            }
            case OperatorEnum.Year: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).year();
            }
            case OperatorEnum.Hour: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).getHours();
            }
            case OperatorEnum.Minute: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).getMinutes();
            }
            case OperatorEnum.Second: {
                if (lhs == null || lhs == undefined)
                    return lhs;

                return Date.asDate(lhs).getSeconds();
            }
            case OperatorEnum.Quarter: {
                if (BravoExpressionEvaluator.onValueRequired.hasHandlers) {
                    var _e = new ValueEventArgs(expression.Operator, [(lhs)]);
                    BravoExpressionEvaluator.onValueRequired.raise(this, _e);
                    return _e.value;
                }

                if (lhs == null || lhs == undefined)
                    return lhs;

                return Math.ceil((Date.asDate(lhs).getMonth() + 1) / 3);
            }
            case OperatorEnum.Date: {
                var _args = lhs instanceof Array ? lhs : null;
                if (_args == null) {
                    if (lhs == null || lhs == undefined)
                        return lhs;

                    return Date.asDate(lhs).date();
                }

                if (_args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                if (_args[0] == null || _args[0] == undefined)
                    return _args[0];

                return Date.asDate(_args[0]).date();
            }
            case OperatorEnum.GetDate:
            case OperatorEnum.GetUtcDate:
            case OperatorEnum.GetDatetime:
            case OperatorEnum.GetUtcDatetime: {
                var _args = lhs instanceof Array ? lhs : null;
                if (_args == null)
                    return this.getCurrentDateTime(expression.Operator);

                if (_args.length != 1)
                    throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                        OperatorEnum[expression.Operator].toUpperCase(), 1));

                var _dtParam = Date.asDate(_args[0]);

                _dtParam = expression.Operator == OperatorEnum.GetDate ||
                    expression.Operator == OperatorEnum.GetDatetime ?
                    _dtParam : _dtParam.toUniversalTime();

                return expression.Operator == OperatorEnum.GetDate ||
                    expression.Operator == OperatorEnum.GetUtcDate ?
                    _dtParam.date() : _dtParam;
            }
        }

        //throw new Error(String.format(MessageContstants.NotSupportedError, expression.Operator.toString()))
    }

    private getCurrentDateTime(pOperator: OperatorEnum): Date {
        if (BravoExpressionEvaluator.onValueRequired.hasHandlers) {
            let _e = new ValueEventArgs(pOperator, null);
            BravoExpressionEvaluator.onValueRequired.raise(this, _e);
            return Date.asDate(_e.value);
        }

        let _dtResult = pOperator == OperatorEnum.GetDate ||
            OperatorEnum.GetDatetime ? DateTime.now : DateTime.utcNow;

        return pOperator == OperatorEnum.GetDate || OperatorEnum.GetUtcDate ?
            _dtResult.date() : _dtResult;
    }

    private evaluateSourceDataExpression(expression: BravoExpression, options: { pzSourceDataName: string }): any {
        if (expression.Operator == OperatorEnum.Value) {
            let _zName = BravoExpressionEvaluator.convert<string>(expression.Value, TypeCode.String);
            options.pzSourceDataName = _zName

            switch (_zName.toUpperCase()) {
                case PARENT_QUALIFIER:
                    {
                        if (this._evaluatingDataRow == null) {
                            let _pr = this.raiseOnParentRowRequired();
                            if (!_pr)
                                throw new Error("Cannot find parent row when evaluating row is null.");

                            options.pzSourceDataName = _pr.table.name;
                            return _pr;
                        }
                        else {
                            let _pr: WebDataRow = null;
                            if (this._evaluatingDataRow.table.parentRelations.List.length < 1) {
                                _pr = this.raiseOnParentRowRequired();
                            }
                            else {
                                options.pzSourceDataName = this._evaluatingDataRow.table.parentRelations.get(0).relationName;
                                // _pr = this._evaluatingDataRow.table.
                                if (!_pr) _pr = this.raiseOnParentRowRequired();
                            }

                            if (!_pr)
                                throw new Error("The row does not have parent relation.");

                            options.pzSourceDataName = _pr.table.name;
                            return _pr;
                        }
                    }
                case CHILD_QUALIFIER:
                    {
                        if (this._evaluatingDataRow)
                            throw new Error("Cannot find child row when evaluating row is null.");

                        if (this._evaluatingDataRow.table.childRelations.List.length < 1)
                            throw new Error("The row does not have child relation.");

                        options.pzSourceDataName = this._evaluatingDataRow.table.name;

                        /* var _rs = this._evaluatingDataRow.GetChildRows(_evaluatingDataRow.Table.ChildRelations[0]);
                        if (_rs == null)
                            throw new NullReferenceException(Properties.Resources.RowDoesNotHaveChildRelation);

                        if (_rs.Length > 0) pzSourceDataName = _rs[0].Table.TableName;
                        return _rs; */
                        return null;
                    }
                default: {
                    if (this._evaluatingDataRow) {
                        // let _zTableName = BravoExpressionEvaluator.getTableName(_zName, this._evaluatingDataRow.table)
                    }

                    if (!this._evaluatingDataRow && this.onDefaultValueRequired) {
                        let _valueArgs = new ValueEventArgs(expression.Operator, [_zName]);
                        this.onDefaultValueRequired.raise(_valueArgs);
                        return _valueArgs.value;
                    }

                    throw new Error("InvalidExpressionException: " + _zName);
                }
            }
        }
        else {
            switch (expression.Operator) {
                case OperatorEnum.Parent:
                    {
                        let _args = BravoExpressionEvaluator.convert<string>(expression.Expressions[0].Value, TypeCode.String);
                        options.pzSourceDataName = _args;

                        if (!this._evaluatingDataRow) {
                            let _pr = this.raiseOnParentRowRequired();
                            if (_pr == null)
                                throw new Error("Cannot find parent row when evaluating row is null.");

                            options.pzSourceDataName = _pr.table.name;
                            return _pr;
                        }
                        else {
                            /* var _zTableName = getTableName(_args, _evaluatingDataRow.Table.DataSet);
                            pzSourceDataName = _zTableName;
                            DataRow _pr = null;

                            if (!_evaluatingDataRow.Table.ParentRelations.Contains(_zTableName)) {
                                _pr = raiseOnParentRowRequired();
                                if (_pr == null)
                                    throw new NullReferenceException(string.Format(Properties.Resources.TableDoesNotExist, _zTableName));
                            }
                            else {
                                _pr = _evaluatingDataRow.GetParentRow(_evaluatingDataRow.Table.ParentRelations[_zTableName]);
                                if (_pr == null) _pr = raiseOnParentRowRequired();
                                if (_pr == null)
                                    throw new NullReferenceException(Properties.Resources.RowDoesNotHaveParentRelation);
                            }

                            pzSourceDataName = _pr.Table.TableName;
                            return _pr; */
                        }
                    }

                case OperatorEnum.Child:
                    {
                        let _args = BravoExpressionEvaluator.convert<string>(expression.Expressions[0].Value, TypeCode.String);

                        options.pzSourceDataName = _args;

                        if (!this._evaluatingDataRow)
                            throw new Error("Cannot find child row when evaluating row is null.");

                        /* var _zTableName = getTableName(_args, _evaluatingDataRow.Table.DataSet);

                        pzSourceDataName = _zTableName;

                        if (!_evaluatingDataRow.Table.ChildRelations.Contains(_zTableName))
                            throw new NullReferenceException(string.Format(Properties.Resources.TableDoesNotExist, _zTableName));

                        var _rs = _evaluatingDataRow.GetChildRows(_evaluatingDataRow.Table.ChildRelations[_zTableName]);
                        if (_rs == null)
                            throw new NullReferenceException(Properties.Resources.RowDoesNotHaveChildRelation);

                        if (_rs.Length > 0) pzSourceDataName = _rs[0].Table.TableName;
                        return _rs; */
                        return null;
                    }

                default:
                    {
                        options.pzSourceDataName = String.empty;
                        return this.evaluateExpression(expression);
                    }
            }
        }
    }

    private evaluateValueExpression(expression: BravoExpression): any {
        if (expression.Value == null && expression.Value == undefined) {
            throw new Error(MessageContstants.ValueCanNotNull);
        }

        if (isString(expression.Value)) {
            let stringValue = expression.Value as string;

            // The NULL value
            if (String.compare(stringValue, NULL_VALUE, SensitivityEnum.Base) == 0)
                return null;

            // The keyword
            if (BravoExpressionEvaluator.isKeyword(stringValue))
                return stringValue;

            // The quote
            if (stringValue.startsWith("'")) {
                let _nStart = 1, _nLen = stringValue.length;
                if (stringValue.endsWith("'"))
                    _nLen -= 1;

                return stringValue.substring(_nStart, _nLen);
            }

            // The local variable
            if (stringValue.startsWith(VARIABLE_PREFIX)) {
                if (!this.variables.containsKey(stringValue))
                    throw new Error(String.format("Must declare the local variable '{0}'.", stringValue));

                return this.variables.get(stringValue);
            }

            // The form parameter
            if (stringValue.startsWith(PARAMETER_PREFIX))
                return this.raiseOnParameterValueRequired(stringValue);

            if (this._evaluatingDataRow)
                return this.evaluateDataRow(this._evaluatingDataRow, stringValue);

            if (this._evaluatingObject)
                return this.evaluateObject(this._evaluatingObject, stringValue);

            if (this.onDefaultValueRequired.hasHandlers) {
                let _valueArgs = new ValueEventArgs(expression.Operator, new Array(expression.Value));
                this.onDefaultValueRequired.raise(this, _valueArgs);
                return _valueArgs.value;
            }

            throw new Error('InvalidExpressionException: ' + stringValue);
        }

        return expression.Value;
    }

    private evaluateObject(dataItem: Object, member: string) {
        if (!dataItem) {
            throw new Error(String.format(MessageContstants.ArgumentNullError, "dataItem"));
        }

        if (!member) {
            throw new Error(String.format(MessageContstants.ArgumentNullError, "member"));
        }

        let _val = null;

        if (dataItem.hasOwnProperty(member))
            _val = dataItem[member];

        if (this.bEnableTracing) {
            if (_val == null)
                this._tracer += String.format("{0}.{1}: <null>", dataItem, member);
            else if (_val == undefined)
                this._tracer += String.format("{0}.{1}: <NULL>", dataItem, member);
            else
                this._tracer += String.format("{0}.{1}: {2:G} ({3})",
                    dataItem, member, _val, typeof (_val));
        }

        return _val;
    }

    private evaluateDataRow(dataRow: WebDataRow, member: string) {
        if (!dataRow)
            throw new Error("dataRow argument null");

        if (!member)
            throw new Error("member argument null");

        var _bIsTracing = this.bEnableTracing && !this._aggregateCalculating;
        if (_bIsTracing)
            this._tracer += String.format("{0}.{1}: ", dataRow.table.name, member);

        if (dataRow.table.extendedProperties.containsKey(TableExpressionCollection)) {
            var _exprs = dataRow.table.extendedProperties.getValue(TableExpressionCollection)
                instanceof Dictionary ? dataRow.table.extendedProperties.getValue(TableExpressionCollection) :
                null;
            if (_exprs != null && _exprs.containsKey(member)) {
                try {
                    var _eval = new BravoExpressionEvaluator();
                    _eval.bEnableTracing = this.bEnableTracing;

                    _eval.onLocalValueRequired.addHandler((o, e: ValueEventArgs) => {
                        var _e = new ValueEventArgs(e.Operator, e.arguments);
                        this.onLocalValueRequired.raise(_eval, _e);

                        e.value = _e.value;
                    });

                    if (this.onParentRowRequired != null)
                        _eval.onParentRowRequired.addHandler((o, e: ParameterValueEventArgs) => {
                            e.value = this.raiseOnParentRowRequired(o);
                        });

                    if (this.onParameterValueRequired != null)
                        _eval.onParameterValueRequired.addHandler((o, e: ParameterValueEventArgs) => {
                            e.value = this.raiseOnParameterValueRequired(e.name, <BravoExpressionEvaluator>o);
                        });

                    //var _val = _eval.evaluate(BravoExpression.create(_exprs[member]), dataRow);
                    var _val = _eval.evaluate(_exprs[member], dataRow);

                    if (_bIsTracing) {
                        this._tracer += '\n';
                        if (_eval.tracer.length > 0)
                            this._tracer += _eval.tracer;
                    }

                    return _val;
                }
                catch (_ex) {
                    throw _ex
                }
            }
        }

        if (!dataRow.table.columns.contains(member))
            throw new Error(String.format("Column '{0}' does not exists in table '{1}'", member, dataRow.table.name));

        return dataRow.getValue(member);
    }

    private static getAggregateSource(item: any): any[] {
        let _dr = item instanceof WebDataRow ? item : null;
        if (_dr) {
            return [_dr];
        }
        else if (item instanceof Array) {
            return item;
        }

        return null;
    }

    private evaluateAggregateExpression(expression: BravoExpression) {
        let _aggregate: IAggregate = null,
            _aggregateSource: any[] = null,
            _aggregateExpression: BravoExpression = null,
            _condition: BravoExpression = null,
            _zAggregateSourceName = null;

        let _args = BravoExpressionEvaluator.getArgumentExpressions(expression.Expressions[0]);
        if (expression.Operator == OperatorEnum.Sum ||
            expression.Operator == OperatorEnum.Min ||
            expression.Operator == OperatorEnum.Max ||
            expression.Operator == OperatorEnum.Avg ||
            expression.Operator == OperatorEnum.Count ||
            expression.Operator == OperatorEnum.Mode) {
            if (_args.length > 2)
                throw new Error(`The ${OperatorEnum[expression.Operator]} function requires 2 argument(s).`);

            if (_args.length == 2) {
                let _obj = this.evaluateSourceDataExpression(_args[0], {
                    pzSourceDataName: _zAggregateSourceName
                });
                _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                _aggregateExpression = _args[1];
            }
            else if (_args.length == 1) {
                if (_args[0].Operator == OperatorEnum.MemberAccess) {
                    let _obj = this.evaluateSourceDataExpression(_args[0].Expressions[0], {
                        pzSourceDataName: _zAggregateSourceName
                    });
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = _args[0].Expressions[1];
                }
                else if (expression.Operator == OperatorEnum.Count) {
                    let _obj = this.evaluateAggregateExpression(_args[0]);
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = null;
                }
                else {
                    _zAggregateSourceName = this._evaluatingDataRow.table.name;
                    _aggregateSource = this._evaluatingDataRow.table.rows;
                    _aggregateExpression = _args[0];
                }
            }
            else {
                _zAggregateSourceName = this._evaluatingDataRow.table.name;
                _aggregateSource = this._evaluatingDataRow.table.rows;
                _aggregateExpression = null;
            }

            switch (expression.Operator) {
                case OperatorEnum.Sum:
                    _aggregate = new SumAggregate();
                    break;
                case OperatorEnum.Min:
                    _aggregate = new MinAggregate();
                    break;
                case OperatorEnum.Max:
                    _aggregate = new MaxAggregate();
                    break;
                case OperatorEnum.Avg:
                    _aggregate = new AvgAggregate();
                    break;
                case OperatorEnum.Count:
                    _aggregate = new CountAggregate();
                    break;
                case OperatorEnum.Mode:
                    _aggregate = new ModeAggregate();
                    break;
            }
        }
        else if (expression.Operator == OperatorEnum.Concat) {
            if (_args.length < 1 || _args.length > 3)
                throw new Error(`The ${OperatorEnum[expression.Operator]} function requires 2 argument(s).`);

            if (_args.length == 3) {
                let _obj = this.evaluateSourceDataExpression(_args[0], {
                    pzSourceDataName: _zAggregateSourceName
                });
                _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                _aggregateExpression = _args[1];

                let _separator = this.evaluateExpression(_args[2]);
                _aggregate = new ConcatAggregate(_separator);
            }
            else if (_args.length == 2) {
                if (_args[0].Operator == OperatorEnum.MemberAccess) {
                    let _obj = this.evaluateSourceDataExpression(_args[0].Expressions[0], {
                        pzSourceDataName: _zAggregateSourceName
                    });
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = _args[0].Expressions[1];
                }
                else {
                    _zAggregateSourceName = this._evaluatingDataRow.table.name;
                    _aggregateSource = this._evaluatingDataRow.table.rows;
                    _aggregateExpression = _args[0];
                }

                let _separator = this.evaluateExpression(_args[1]);
                _aggregate = new ConcatAggregate(_separator);
            }
            else {
                if (_args[0].Operator == OperatorEnum.MemberAccess) {
                    var _obj = this.evaluateSourceDataExpression(_args[0].Expressions[0], {
                        pzSourceDataName: _zAggregateSourceName
                    });
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = _args[0].Expressions[1];
                }
                else {
                    _zAggregateSourceName = this._evaluatingDataRow.table.name;
                    _aggregateSource = this._evaluatingDataRow.table.rows;
                    _aggregateExpression = _args[0];
                }

                _aggregate = new ConcatAggregate(String.empty);
            }
        }
        else if (expression.Operator == OperatorEnum.SumIf ||
            expression.Operator == OperatorEnum.CountIf) {
            if (_args.length < 1 || _args.length > 3)
                throw new Error(String.format(MessageContstants.RequiredFunctionArgument,
                    OperatorEnum[expression.Operator].toUpperCase(), 3));

            if (_args.length == 3) {
                var _obj = this.evaluateSourceDataExpression(_args[0], {
                    pzSourceDataName: _zAggregateSourceName
                });
                _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                _aggregateExpression = _args[1];
                _condition = _args[2];
            }
            else if (_args.length == 2) {
                if (_args[0].Operator == OperatorEnum.MemberAccess) {
                    var _obj = this.evaluateSourceDataExpression(_args[0].Expressions[0], {
                        pzSourceDataName: _zAggregateSourceName
                    });
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = _args[0].Expressions[1];
                }
                else {
                    _zAggregateSourceName = this._evaluatingDataRow.table.name;
                    _aggregateSource = this._evaluatingDataRow.table.rows;
                    _aggregateExpression = _args[0];
                }

                _condition = _args[1];
            }
            else {
                if (_args[0].Operator == OperatorEnum.MemberAccess) {
                    var _obj = this.evaluateSourceDataExpression(_args[0].Expressions[0], {
                        pzSourceDataName: _zAggregateSourceName
                    });
                    _aggregateSource = BravoExpressionEvaluator.getAggregateSource(_obj);
                    _aggregateExpression = _args[0].Expressions[1];
                }
                else {
                    _zAggregateSourceName = this._evaluatingDataRow.table.name;
                    _aggregateSource = this._evaluatingDataRow.table.rows;
                    _aggregateExpression = _args[0];
                }
            }

            switch (expression.Operator) {
                case OperatorEnum.SumIf:
                    _aggregate = new SumAggregate();
                    break;
                case OperatorEnum.CountIf:
                    _aggregate = new CountAggregate();
                    break;
            }
        }
        else {
            throw new Error(`Not support operator ${expression.Operator}`);
        }

        this._aggregateCalculating = true;

        try {
            var _bIsTracing = this.bEnableTracing;
            if (_bIsTracing)
                this._tracer += String.format("{0}=>{1}=>{2}: ",
                    expression.Operator,
                    _zAggregateSourceName,
                    _aggregateExpression ? _aggregateExpression.Value : "<empty>");

            _aggregate.init();

            for (let _i = 0; _i < _aggregateSource.length; _i++) {
                let _row = _aggregateSource[_i];

                if (_condition && BravoExpressionEvaluator.isTrueValue(this.evaluateCollection([_condition], _row)))
                    continue;

                if (_aggregateExpression)
                    _aggregate.accumulate(this.evaluateCollection([_aggregateExpression], _row));
                else
                    _aggregate.accumulate(0);
            }

            let _val = _aggregate.terminate();

            if (_bIsTracing) {
                if (_val == null)
                    this._tracer += "<null>";
                else if (_val == undefined)
                    this._tracer += "<NULL>";
                else
                    this._tracer += String.format("{0} ({1})", _val, typeof (_val));

                this._tracer += '\n';
            }

            return _val;
        }
        finally {
            this._aggregateCalculating = false;
        }
    }

    protected raiseOnParentRowRequired(pEval: BravoExpressionEvaluator = null) {
        if (!this.onParentRowRequired.hasHandlers) return null;

        let _e = new ParameterValueEventArgs(null);
        this.onParentRowRequired.raise(pEval == null ? this : pEval, _e);
        return <WebDataRow>_e.value;
    }

    protected raiseOnParameterValueRequired(pzName: string, pEval: BravoExpressionEvaluator = null) {
        if (!this.onParameterValueRequired.hasHandlers) return null;

        let _e = new ParameterValueEventArgs(pzName);
        this.onParameterValueRequired.raise(_e);
        return _e.value;
    }

    public getFormat(pzFormat: string): string {
        if (pzFormat && String.compare(pzFormat, "C") == 0)
            return String.format("{0}", this.evaluate("FORMATCURRENCY()"));
        else if (pzFormat && String.compare(pzFormat, "Q") == 0)
            return String.format("{0}", this.evaluate("FORMATQUANTITY()"));
        else
            return pzFormat;
    }
}

//#region helper classes

export class ValueEventArgs extends EventArgs {
    public readonly Operator: OperatorEnum;
    public readonly arguments: any[];
    public value: any;

    constructor(pOperator: OperatorEnum, pArguments: any[]) {
        super();
        this.Operator = pOperator;
        this.arguments = pArguments;
    }
}

export class ParameterValueEventArgs extends EventArgs {
    public readonly name: string;
    public value: any;

    constructor(pName) {
        super();
        this.name = pName;
    }
}

interface IAggregate {
    init(): void;
    accumulate(value: any): void;
    terminate(): any;
}

class SumAggregate implements IAggregate {
    private _value: any;

    init(): void {
    }

    accumulate(value: any): void {
        if (!value)
            return;

        if (!this._value) {
            this._value = value;
            return;
        }

        this._value = BravoExpressionEvaluator.addition(this._value, value);
    }

    terminate() {
        return this._value;
    }
}

class ConcatAggregate implements IAggregate {
    private _value: string;
    private _separator: string;

    public get separator(): string {
        return this._separator;
    }

    constructor(pSeparator: string) {
        this._separator = pSeparator;
    }

    init(): void {
        this._value = String.empty;
    }

    accumulate(value: any): void {
        if (!value) return;
        this._value.concat(value).concat(this._separator);
    }

    terminate() {
        let _output = String.empty;
        if (this._value.length > 0)
            _output = this._value.substring(0, this._value.length - this._separator.length);
    }
}

class MaxAggregate implements IAggregate {
    private _value: any;

    init(): void {
    }

    accumulate(value: any): void {
        if (!value) return;

        if (!this._value) {
            this._value = value;
            return;
        }

        if (BravoExpressionEvaluator.compare(this._value, value) < 0)
            this._value = value;
    }

    terminate() {
        return this._value;
    }
}

class MinAggregate implements IAggregate {
    private _value: any;

    init(): void {
    }

    accumulate(value: any): void {
        if (!value) return;

        if (!this._value) {
            this._value = value;
            return;
        }

        if (BravoExpressionEvaluator.compare(this._value, value) > 0)
            this._value = value;
    }

    terminate() {
        return this._value;
    }
}

class AvgAggregate implements IAggregate {
    private _value: any;
    private _count: number;

    init(): void {
    }

    accumulate(value: any): void {
        if (!value) return;

        if (this._value) {
            this._value = value;
            this._count = 1;
            return;
        }

        this._value = BravoExpressionEvaluator.addition(this._value, value);
        this._count++;
    }

    terminate() {
        if (this._count <= 0) return this._value;
        return BravoExpressionEvaluator.division(this._value, this._count);
    }
}

class CountAggregate implements IAggregate {
    private _count: number;

    init(): void {
        this._count = 0;
    }

    accumulate(value: any): void {
        if (!value) return;
        this._count++;
    }

    terminate() {
        return this._count;
    }
}

class ModeAggregate implements IAggregate {
    private _dic: Dictionary<any, number> = null;

    init(): void {
        this._dic = new Dictionary<any, number>();
    }

    accumulate(value: any): void {
        if (!value) return;

        if (this._dic.containsKey(value))
            this._dic.get(value).value++;
        else
            this._dic.get(value).value = 1;
    }

    terminate() {
        if (this._dic.count == 0)
            return null;

        let cnt = 0,
            value = null;

        for (let _i = 0; _i < this._dic.count; _i++) {
            let _key = this._dic.keys[_i],
                _value = this._dic.values[_i];

            if (_value > cnt) {
                cnt = _value;
                value = _key;
            }
        }

        return value;
    }
}

//#endregion helper classes