import { MessageContstants } from "./common/message.constants";
import { BravoCulture } from "./bravo.culture";
import * as wjc from "wijmo/wijmo";
import { DatePartEnum } from "./enums";
import { CryptoExtension } from './crypto.extension';
import { httpRequest } from './bravo.core.function';

export class ExtensionsMethod {
    public static convertDateFromWS(pValue: string) {
        if (pValue && pValue.substring(0, 6) == "/Date(")
            return new Date(parseInt(pValue.substring(6, pValue.length - 2)));

        return null;
    }

    public static byteArrayToString(byteArray) {
        var str = "", i;
        for (i = 0; i < byteArray.length; ++i) {
            str += escape(String.fromCharCode(byteArray[i]));
        }
        return str;
    }

    public static guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    public static getTempName(): string {
        return `_${Math.random().toString(36).substring(7)}`;
    }

    public static sortBy(pzItemName: string, pValue1: object, pValue2: object, reverse: boolean = false) {
        let _val1 = pValue1[pzItemName],
            _val2 = pValue2[pzItemName];

        let _sign = !reverse ? 1 : -1;

        if (Date.isDate(_val1) && Date.isDate(_val2)) {
            let _dateA = Date.asDate(_val1).getTime();
            let _dateB = Date.asDate(_val2).getTime();

            return _dateA > _dateB ? _sign * 1 : _sign * -1;
        }
        else {
            if (_val1 < _val2) return _sign * -1;
            if (_val1 > _val2) return _sign * 1;
            return 0;
        }
    }

    public static containsEnum(enumType: any, value: any) {
        for (const key in enumType) {
            if (key === value || (wjc.isString(key) && wjc.isString(value) && key.toLowerCase() == value.toLowerCase()))
                return true;
        }

        return false;
    }

    public static parseExceptionFromServer(pException): any {
        if (!pException || !pException.error) return pException;

        let _zError: string = pException.error;
        let _zErrorMessage: any,
            _parser = new DOMParser(),
            _xmlDoc = _parser.parseFromString(_zError, 'text/xml');

        if (_xmlDoc) {
            let _errors = _xmlDoc.querySelectorAll('Message');
            if (_errors) {
                for (let _n = 0; _n < _errors.length; _n++) {
                    if (!_zErrorMessage || _zErrorMessage.length <= 0)
                        _zErrorMessage = _errors.item(_n).innerHTML;
                    else
                        _zErrorMessage += '\n' + _errors.item(_n).innerHTML;
                }
            }

            if (!_zErrorMessage) {
                let _content = _xmlDoc.getElementById('content');
                if (_content) {
                    if (_content.children.length > 1)
                        _zErrorMessage = _content.children.item(1).textContent;
                }
                else {
                    let _error: any = _xmlDoc.getElementsByTagName('parsererror');
                    if (_error && _error.length > 0) {
                        _error = _error.item(0);
                        if (_error instanceof HTMLElement) {
                            _zErrorMessage = document.createElement('div');
                            _zErrorMessage.innerHTML = _error.innerHTML;

                            wjc.setCss(_zErrorMessage, _error.style);
                        }
                    }
                }
            }
        }

        return _zErrorMessage;
    }

    public static renderImage(imageName: string, extensionName: string = 'png', base64?: string, width: number = -1, height: number = -1): HTMLElement {
        if (!imageName && !base64) return document.createElement('img');

        let _imgElement: HTMLElement = null;

        if (!String.isNullOrEmpty(imageName)) {
            if (imageName.startsWith('web-')) {
                _imgElement = document.createElement('i');
                _imgElement.style.textAlign = 'center';
                _imgElement.classList.add('fa', `fa-${imageName.substring(4)}`);
            }
            else {
                _imgElement = document.createElement('img');
                if (_imgElement instanceof HTMLImageElement) {
                    _imgElement.src = `${location.origin}/assets/img/${imageName}.${extensionName}`;
                    _imgElement.alt = String.empty;
                }
            }
        }
        else if (base64 != null) {
            _imgElement = document.createElement('img');
            if (_imgElement instanceof HTMLImageElement) {
                let _imageData = String.format("data:image/{0};base64,{1}", extensionName, base64);

                /* let _buff = ArrayBufferBase64.decode(base64);
                let _blob = new Blob([_buff], { type: `image/${extensionName}` });
                let _url = URL.createObjectURL(_blob); */
                _imgElement.src = _imageData;
            }
        }

        if (width != -1) _imgElement.style.width = width + 'px';
        if (height != -1) _imgElement.style.height = height + 'px';

        return _imgElement;
    }

    public static deserializebase64(base64: string, pbAllowCache: boolean = false) {
        let _zKey = CryptoExtension.sha256(base64);
        let _zValue = localStorage.getItem(_zKey);

        if (pbAllowCache && !String.isNullOrEmpty(_zValue))
            return _zValue;

        let xhr = httpRequest('http://bravo8.bravo.com.vn/api/helper/deserializebase64', {
            method: 'POST',
            async: false,
            data: JSON.stringify(base64),
            contentType: 'application/json'
        });

        if (xhr.responseText) {
            _zValue = xhr.responseText.trimChars('"');

            if (pbAllowCache)
                localStorage.setItem(_zKey, _zValue);
        }

        return _zValue;
    }

    public static rftToHtml(pzContent: string) {
        if (String.isNullOrEmpty(pzContent))
            return String.empty;

        let xhr = httpRequest('http://bravo8.bravo.com.vn/api/helper/asposertf', {
            method: 'POST',
            async: false,
            data: JSON.stringify(pzContent),
            contentType: 'application/json'
        });

        return xhr.responseText;
    }

    public static renderLink(componentName: string, commandKey: string, text: string): HTMLElement {
        if (!componentName && !commandKey)
            return null;

        let _anchorElement = document.createElement('a');
        _anchorElement.classList.add('bravo-tool-strip-redirect');
        _anchorElement.innerHTML = `<div>${text}</div>`;
        _anchorElement.href = `#/${componentName ? componentName.toLowerCase() + '/' : ''}view/${commandKey}`;

        return _anchorElement;
    }

    public static addHighlightText(pElement: HTMLElement, pnIndex: number, pnLeng: number, cssClasName?: string) {
        let _zText = pElement.innerText;
        let _zHighlightText = _zText.substr(pnIndex, pnLeng);

        let _newInnerText = _zText.replace(new RegExp(_zHighlightText, 'gi'), (match, expr) => {
            if (cssClasName) {
                return String.format("<span class='{0}'>{1}</span>", cssClasName, match);
            } else {
                return String.format("<span style='background:yellow;'>{0}</span>", match);
            }
        });
        pElement.innerHTML = pElement.innerHTML.replace(_zText, _newInnerText);
    }

    public static isRtfString(pzText: string) {
        return !String.isNullOrEmpty(pzText) && pzText.startsWith(`{\\rtf`);
    }
}

export class ArrayBufferBase64 {
    private static chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    public static encode(arrayBuffer) {
        let bytes = new Uint8Array(arrayBuffer),
            i, len = bytes.length, base64 = "";

        for (i = 0; i < len; i += 3) {
            base64 += this.chars[bytes[i] >> 2];
            base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += this.chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
    }

    public static decode(base64: string) {
        // Use a lookup table to find the index.
        let lookup = new Uint8Array(256);
        for (let i = 0; i < this.chars.length; i++) {
            lookup[this.chars.charCodeAt(i)] = i;
        }

        let bufferLength = base64.length * 0.75,
            len = base64.length, i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return bytes;
    }
}

declare global {
    interface StringConstructor {
        format(text: string, ...args: any[]): string;
        isNullOrEmpty(text: string): boolean;
        removeAccent(text: string): string;
        asString(value): string;
        isBase64(value): boolean;
        compare(value: string, value1: string, options?: SensitivityEnum): number;
        empty: string;
    }

    interface DateConstructor {
        year;
        month;
        date;
        defaultFormat: string;
        isDate(value): boolean;
        asDate(value): Date;
        dateAdd(datePart: DatePartEnum, num: number, date: any): Date;
        dateDiff(datePart: DatePartEnum, startDate: any, end: any): Number;
        fromBinary(value: number): Date;
    }

    interface NumberConstructor {
        isNumber(value): boolean;
        asNumber(value): number;
    }

    interface BooleanConstructor {
        isBoolean(value): boolean;
        asBoolean(value): boolean;
        trueString: string;
        falseString: string;
    }

    interface String {
        trimStart(): string;
        trimEnd(c?: string): string;
        trimChars(...c: string[]): string;
        stuff(start: number, length: number, str: string): string;
        removeAccent(): string;
        right(num: number): string;
        left(num: number): string;
        insert(index: number, value: string);
        remove(startIndex: number, length: number);
        firstLowerCase();
        toValidFileName(): string;
    }

    interface Number {
        str(length: number, scale: number);
        round(places): number;
    }

    interface Array<T> {
        clear();
        expect(items: Array<T>);
        intersect(...items: Array<T>): Array<T>;
        clone(): Array<T>;
        //remove(item: T);
        // removeAt(index: number);
    }

    interface Date {
        date(): Date;
        dateUTC(): Date;
        toUniversalTime(): Date;
        toLocalTime(): Date;
        day(): number;
        month(): number;
        year(): number;
        dayOfYear(): number;
        addMonths(value: number): Date;
        addDays(value: number): Date;
        toLocaleStringWidthFormat(format?: string): string;
        toBinary();
    }
}

String.prototype.insert = function (index, value) {
    if (index > 0)
        return this.substring(0, index) + value + this.substring(index, this.length);
    else
        return value + this;
}

String.prototype.remove = function (startIndex, length) {
    return this.substr(0, startIndex) + this.substr(startIndex + length);
}

String.prototype.right = function (num: number): string {
    return this.substr(this.length, Math.min(this.length, num));
}

String.prototype.left = function (num: number): string {
    return this.substr(0, Math.min(this.length, num));
}

String.prototype.trimStart = function () {
    return this.replace(/^\s+/, "");
}

String.prototype.trimEnd = function (c?: string) {
    if (!c) {
        return this.replace(/ +$/, "");
    }
    else {
        if (this.endsWith(c)) {
            let _nPos = this.lastIndexOf(c);
            if (_nPos > 0) return this.substring(0, _nPos);
        }
    }

    return this;
}

String.prototype.toValidFileName = function (): string {
    return this.replace(/[/\\?%*:|"<>]/g, "");
}

String.empty = '';

String.prototype.removeAccent = function () {
    return this.normalize("NFKD")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[\u0300-\u036f]/g, "");
}

String.prototype.stuff = function (start: number, length: number, str: string): string {
    let strSource = this.substring(start, start + length);
    let rs = this.replace(strSource, str);

    return rs;
}

String.prototype.firstLowerCase = function () {
    return this.substring(0, 1).toLowerCase() + this.substring(1);
}

String.format = function (text, ...args: any[]) {
    return text.replace(/{(\d+)}/g, function (match, number) {
        if (args[number] === undefined || args[number] == null)
            return '';

        return args[number];
    });
};

String.isNullOrEmpty = function (text): boolean {
    return text == null || text === "" || text === void 0;
}

String.compare = function (value: string, value1: string, options: SensitivityEnum = SensitivityEnum.Variant): number {
    if (value == null && value1 == null)
        return 0;

    if (value == null) return -1;

    if (options == SensitivityEnum.Variant)
        return value.localeCompare(value1);

    return value.localeCompare(value1, BravoCulture.ci, { sensitivity: options });
}

export enum SensitivityEnum {
    Base = 'base',
    Accent = 'accent',
    Case = 'case',
    Variant = 'variant'
}

String.removeAccent = function (text) {
    return text.normalize('NFKD')
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[\u0300-\u036f]/g, "");
}

String.prototype.trimChars = function (...c: string[]) {
    if (c && c.length == 1) {
        var re = new RegExp("^[" + c + "]+|[" + c + "]+$", "g");
        return this.replace(re, "");
    }

    if (c && c.length > 1) {
        let _rs = this;

        for (const _c of c)
            _rs = _rs.replace(new RegExp("^[" + _c + "]+|[" + _c + "]+$", "g"), "");

        return _rs;
    }
}

String.asString = function (value): string {
    if (typeof (value) === 'string') {
        return value;
    }
}

const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
String.isBase64 = function (value): boolean {
    return value && base64Regex.test(value);
}

Array.prototype.clear = function () {
    while (this.length > 0) {
        this.pop();
    }
}

Array.prototype.expect = function (items) {
    return this.filter(x => !items.includes(x));
}

Array.prototype.intersect = function (...a): Array<any> {
    return [this, ...a].reduce((p, c) => p.filter(e => c.includes(e)));
}

Array.prototype.clone = function () {
    return this.slice(0);
}

/* Array.prototype.removeAt = function (index: number) {
    this.slice(index, 1);
}

Array.prototype.remove = function (item: any) {
    let _index = this.findIndex(it => it == item);
    if (_index > -1 && _index < this.length - 1)
        this.removeAt(_index);
} */

const DatePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/;
const DatePattern1 = /^(\d{4})-(\d{2})-(\d{2})$/;
const msecPerMinute = 1000 * 60;
const msecPerHour = msecPerMinute * 60;
const msecPerDay = msecPerHour * 24;

Date.isDate = function (value) {
    if (typeof value === 'string') {
        if (DatePattern.test(value) || DatePattern1.test(value)) {
            return true;
        }
    }
    else if (value instanceof Date) {
        return true;
    }

    return false;
}

Date.asDate = function (value) {
    if (!value) return null;

    if (typeof value === 'string') {
        let _m = DatePattern.exec(value);
        if (_m) {
            let utcMilliseconds = Date.UTC(+_m[1], +_m[2] - 1, +_m[3], +_m[4], +_m[5], +_m[6]);
            return new Date(utcMilliseconds);
        }

        let _m1 = DatePattern1.exec(value);
        if (_m1) {
            let utcMilliseconds = Date.UTC(+_m1[1], +_m1[2] - 1, +_m1[3]);
            return new Date(utcMilliseconds);
        }
    }

    if (value instanceof Date)
        return value;
}

Date.dateAdd = function (datePart: DatePartEnum, num: number, date: any): Date {
    let _date = Date.asDate(date);  //<Date>BravoDataTypeConverter.convertValue(date, TypeCode.DateTime);

    switch (datePart) {
        case DatePartEnum.year:
        case DatePartEnum.yy:
        case DatePartEnum.yyyy: {
            _date.setFullYear(_date.getFullYear() + num);
            break;
        }

        case DatePartEnum.quarter:
        case DatePartEnum.qq:
        case DatePartEnum.q: {
            _date.setMonth(_date.getMonth() + num * 3);
            break;
        }

        case DatePartEnum.month:
        case DatePartEnum.mm:
        case DatePartEnum.m: {
            _date.setMonth(_date.getMonth() + num);
            break;
        }

        case DatePartEnum.dayofyear:
        case DatePartEnum.dy:
        case DatePartEnum.d:

        case DatePartEnum.weekday:
        case DatePartEnum.dw:

        case DatePartEnum.day:
        case DatePartEnum.dd:
        case DatePartEnum.d: {
            _date.setDate(_date.getDate() + num);
            break;
        }

        case DatePartEnum.week:
        case DatePartEnum.wk:
        case DatePartEnum.ww: {
            _date.setDate(_date.getDate() + num * 7);
            break;
        }

        case DatePartEnum.hour:
        case DatePartEnum.hh: {
            _date.setHours(_date.getHours() + num);
            break;
        }

        case DatePartEnum.minute:
        case DatePartEnum.mi:
        case DatePartEnum.n: {
            _date.setMinutes(_date.getMinutes() + num);
            break;
        }

        case DatePartEnum.second:
        case DatePartEnum.ss:
        case DatePartEnum.s: {
            _date.setSeconds(_date.getSeconds() + num);
            break;
        }

        case DatePartEnum.millisecond:
        case DatePartEnum.ms: {
            _date.setMilliseconds(_date.getMilliseconds() + num);
            break;
        }
    }

    if (_date instanceof Date) return _date;

    throw new Error(String.format(MessageContstants.UnknownDatePart, datePart));
}

Date.dateDiff = function (datePart: DatePartEnum, startDate: any, endDate: any): Number {
    let _startDate = Date.asDate(startDate); //<Date>BravoDataTypeConverter.convertValue(startDate, TypeCode.DateTime);;
    let _endDate = Date.asDate(endDate); //<Date>BravoDataTypeConverter.convertValue(endDate, TypeCode.DateTime);;

    switch (datePart) {
        case DatePartEnum.year:
        case DatePartEnum.yy:
        case DatePartEnum.yyyy: {
            return _endDate.getFullYear() - _startDate.getFullYear();
        }

        case DatePartEnum.quarter:
        case DatePartEnum.qq:
        case DatePartEnum.q: {
            return (_endDate.getFullYear() - _startDate.getFullYear()) +
                (_endDate.getMonth() - 1) / 3 - (_startDate.getMonth() - 1) / 3;
        }

        case DatePartEnum.month:
        case DatePartEnum.mm:
        case DatePartEnum.m: {
            return (12 * _endDate.getFullYear() + _endDate.getMonth()) - (12 * _startDate.getFullYear() + _startDate.getMonth());
        }

        case DatePartEnum.dayofyear:
        case DatePartEnum.dy:
        case DatePartEnum.d:

        case DatePartEnum.weekday:
        case DatePartEnum.dw:

        case DatePartEnum.day:
        case DatePartEnum.dd:
        case DatePartEnum.d: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()) / msecPerDay);
        }

        case DatePartEnum.week:
        case DatePartEnum.wk:
        case DatePartEnum.ww: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()) / msecPerDay) / 7;
        }

        case DatePartEnum.hour:
        case DatePartEnum.hh: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()) / msecPerHour);
        }

        case DatePartEnum.minute:
        case DatePartEnum.mi:
        case DatePartEnum.n: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()) / msecPerMinute);
        }

        case DatePartEnum.second:
        case DatePartEnum.ss:
        case DatePartEnum.s: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()) / 1000);
        }

        case DatePartEnum.millisecond:
        case DatePartEnum.ms: {
            return Math.floor((_endDate.getTime() - _startDate.getTime()));
        }
    }

    throw new Error(String.format(MessageContstants.UnknownDatePart, datePart));
}

Date.defaultFormat = 'dd MMM yyyy hh:mm:ss tt';

Date.prototype.toLocaleStringWidthFormat = function (format?: string): string {
    if (!format)
        return wjc.Globalize.formatDate(this, Date.defaultFormat);
    else
        return wjc.Globalize.formatDate(this, format);
}

Date.prototype.toString = function (): string {
    return wjc.Globalize.formatDate(this, Date.defaultFormat);
}

Date.year = new Date().getFullYear();
Date.month = new Date().getMonth() + 1;
Date.date = new Date().getDate();

Date.fromBinary = function (value: number): Date {
    let ticksToMicrotime = value / 10000;

    //ticks are recorded from 1/1/1; get microtime difference from 1/1/1/ to 1/1/1970
    let epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

    //new date is ticks, converted to microtime, minus difference from epoch microtime
    let tickDate = new Date(ticksToMicrotime - epochMicrotimeDiff);
    let _diffNum = getDiffDate(tickDate);

    return new Date(ticksToMicrotime - epochMicrotimeDiff + _diffNum);
}

Date.prototype.toBinary = function () {
    let now: Date = this;
    let _ticks_1970 = Math.abs(new Date(0, 0, 1).setFullYear(1));

    return (_ticks_1970 + now.getTime() - 400000) * 10000;
}

function getDiffDate(date: Date) {
    return (24 * 60 * 60 - (date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds())) * 1000;
}

Date.prototype.date = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}

Date.prototype.dateUTC = function () {
    return this.toUniversalTime().date();
}

Date.prototype.toUniversalTime = function () {
    return new Date(this.getTime() + this.getTimezoneOffset() * 60000)
}

Date.prototype.toLocalTime = function () {
    let date: any = new Date(this);

    let localOffset = date.getTimezoneOffset() * 60000;
    let localTime = date.getTime();

    date = localTime - localOffset;
    date = new Date(date);

    return date;
}

Date.prototype.day = function () {
    return this.getDate();
}

Date.prototype.month = function () {
    return this.getMonth() + 1;
}

Date.prototype.year = function () {
    return this.getFullYear();
}

Date.prototype.dayOfYear = function () {
    let yn = this.getFullYear();
    let mn = this.getMonth();
    let dn = this.getDate();
    let d1: any = new Date(yn, 0, 1, 12, 0, 0); // noon on Jan. 1
    let d2: any = new Date(yn, mn, dn, 12, 0, 0); // noon on input date
    let ddiff = Math.round((d2 - d1) / 864e5);
    return ddiff + 1;
};

Date.prototype.addMonths = function (value: number): Date {
    let _dt: Date = new Date(this.getTime());
    _dt.setMonth(_dt.getMonth() + value);
    return _dt;

    //return this.setMonth(this.getMonth() + value);
}

Date.prototype.addDays = function (value: number): Date {
    let _dt: Date = new Date(this.getTime());
    _dt.setDate(_dt.getDate() + value);
    return _dt;

    //return this.setDate(this.getDate() + value);
}

Number.prototype.round = function (places: number) {
    return +(Math.round((this + "e+" + places) as any) + "e-" + places);
}

Number.prototype.str = function (length: number, scale: number) {
    let _n: number = this;
    if (scale > 0) {
        _n = this.round(scale);
    }

    let text = _n.toString();
    let arr = text.split('.');
    let intText: string;

    if (scale > 0) {
        let intLen = length - scale - 1;
        intText = arr[0].substring(Math.max(0, arr[0].length - intLen));

        if (arr.length > 1) {
            let decText = arr.length > 0 ? arr[1].substring(0, Math.min(scale, arr[1].length)) : String.empty;
            return intText.padStart(intLen, ' ') + '.' + decText.padEnd(scale, '0');
        }
        else {
            return intText.padStart(intLen, ' ') + "." + "".padEnd(scale, '0');
        }
    }

    intText = arr[0].substring(Math.max(0, arr[0].length - length));

    return intText.padStart(length, ' ');
}

Number.isNumber = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

Number.asNumber = function (value): number {
    if (typeof (value) == 'number')
        return value;

    if (typeof (value) == 'string') {
        let _nVal = parseFloat(value);
        if (!isNaN(_nVal)) return _nVal;
    }
}

Boolean.asBoolean = function (value): boolean {
    if (value == true || value == "True" || value == Boolean.trueString)
        return true;

    return false;
}

Boolean.isBoolean = function (value): boolean {
    if (typeof (value) == 'boolean' || value == 'True' || value == 'False' ||
        value == Boolean.trueString || value == Boolean.falseString)
        return true;

    return false;
}

Boolean.trueString = "true";
Boolean.falseString = "false";