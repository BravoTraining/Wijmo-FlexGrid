import { IKeyedCollection } from "./interface/IKeyedCollection";
import * as wjc from "wijmo/wijmo";
import { BravoLangEnum } from "./enums";
import { BravoLayoutItem } from "./serializations/bravo.layout.item";
import { BravoExpressionEvaluator } from "./expression/bravo.expression.evaluator";
import { BravoClientSettings } from "./bravo.client.settings";

// @dynamic

export class Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(left = 0, top = 0, right = 0, bottom = 0) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    equals(pad: Padding): boolean {
        return (pad instanceof Padding) && this.top == pad.top && this.right == pad.right &&
            this.bottom == pad.bottom && this.left == pad.left;
    }

    clone(): Padding {
        return new Padding(this.left, this.top, this.right, this.bottom);
    }

    public get vertical(): number {
        return this.top + this.bottom;
    }

    public get horizontal(): number {
        return this.left + this.right;
    }

    public get hasValue(): boolean {
        return this.top != 0 || this.bottom != 0 || this.left != 0 || this.right != 0;
    }

    public static get empty(): Padding {
        return new Padding(0, 0, 0, 0);
    }

    toString() {
        return `${this.top}px ${this.right}px ${this.bottom}px ${this.left}px`;
    }
}

export class KeyedCollection<T> implements IKeyedCollection<T>{
    private items: { [index: string]: T } = {};

    private _count: number = 0;

    public containsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public count(): number {
        return this._count;
    }

    public add(key: string, value: T) {
        if (!this.items.hasOwnProperty(key))
            this._count++;

        this.items[key] = value;
    }

    public remove(key: string): T {
        const val = this.items[key];
        delete this.items[key];
        this._count--;
        return val;
    }

    public item(key: string): T {
        return this.items[key];
    }

    public keys(): string[] {
        const keySet: string[] = [];

        for (const prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public values(): T[] {
        const values: T[] = [];

        for (const prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }

        return values;
    }
}

// @dynamic

export class DateTime extends wjc.DateTime {
    public static get now(): Date {
        let _d = new Date();
        return _d;
    }

    public static get utcNow(): Date {
        let _d = new Date();
        return _d.toUniversalTime();
    }
}

const languages: Object = {
    'vi': BravoLangEnum.Vietnamese,
    'en': BravoLangEnum.English,
    'ja': BravoLangEnum.Japanese,
    'zn': BravoLangEnum.Chinese,
    'ko': BravoLangEnum.Korean,
    'cus': BravoLangEnum.Custom
}

export class BravoCore {
    /**
     * Return true if value != (null || undifined)
     * @param value 
     */
    public static isDefined(value: any): boolean {
        return typeof value !== 'undefined' && value !== null;
    }

    public static convertLangToLCID(lang?: string) {
        if (!lang) {
            lang = window.navigator.languages ? window.navigator.languages[0] : null;
            lang = lang || window.navigator.language;
        }

        if (lang.indexOf('-') !== -1)
            lang = lang.split('-')[0];

        if (lang.indexOf('_') !== -1)
            lang = lang.split('_')[0];

        if (languages.hasOwnProperty(lang))
            return languages[lang];

        return BravoLangEnum.English;
    }

    public static convertLCIDToLang(id: number) {
        for (const key in languages) {
            if (languages.hasOwnProperty(key)) {
                const element = languages[key];
                if (element == id) return key;
            }
        }

        return 'en';
    }

    public static toCssString(css: any) {
        let _cssString = String.empty;
        for (let _key in css)
            _cssString += String.format("{0}:{1};", _key, css[_key]);

        return _cssString;
    }

    public static append(element: HTMLElement, contentHtml: any, pbClear: boolean = true) {
        if (pbClear) element.textContent = null;

        if (contentHtml instanceof HTMLElement) {
            element.append(contentHtml);
            return;
        }

        if (wjc.isString(contentHtml)) {
            let _content = document.createElement('div');
            _content.innerHTML = contentHtml;

            element.append(_content);
        }
    }

    public static convertPxStringToNumber(pzNum: string): number {
        if (String.isNullOrEmpty(pzNum))
            return 0;

        pzNum = pzNum.replace('px', '');
        if (Number.isNumber(pzNum))
            return Number.asNumber(pzNum);

        return 0;
    }

    public static getScrollbarWidth() {

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

    public static evalText(pLayoutItem: BravoLayoutItem,
        pExpressionEval: BravoExpressionEvaluator,
        pzLangKey?: string,
        pDataItem?: any): string {

        if (!pzLangKey)
            pzLangKey = BravoClientSettings.zCurrentLang;

        if (!pExpressionEval || !pLayoutItem.value)
            return String.empty;

        if (pLayoutItem.isExpression()) {
            let _zText = pExpressionEval.evaluateText(pLayoutItem.str(pzLangKey), pDataItem);
            return _zText;
        }
        else
            return pLayoutItem.str(pzLangKey);
    }
}

export class Stopwatch {
    private time: number;
    private running: boolean;
    private times: Array<number>;

    public static startNew() {
        let _sw = new Stopwatch();
        _sw.start();

        return _sw;
    }

    constructor() {
        this.reset();
    }

    public get elapsedMilliseconds(): number {
        return Math.round(this.times[2] + this.times[1] * 60 + this.times[0] * 60 * 60) * 10;
    }

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    reset() {
        this.times = [0, 0, 0];
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;

        // Hundredths of a second are 100 ms
        this.times[2] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    print() {
        console.log(this.format(this.times));
    }

    format(times) {
        return `\
            ${pad0(times[0], 2)}:\
            ${pad0(times[1], 2)}:\
            ${pad0(Math.floor(times[2]), 2)}`;
    }
}

function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}
