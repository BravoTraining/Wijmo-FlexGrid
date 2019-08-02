import { EventEmitter } from '@angular/core';
import * as wjc from "wijmo/wijmo";
import { BravoLangEnum, BravoClientSettings } from "../core/core";

// @dynamic

export class BravoSettings {
    public readonly onFontSizeChanged = new EventEmitter();
    public readonly onLanguageChanged = new EventEmitter();

    private static _current: BravoSettings = null;

    public static get current(): BravoSettings {
        if (!this._current)
            this._current = new BravoSettings();
        return this._current;
    }

    public get language(): BravoLangEnum {
        return BravoClientSettings.currentLang;
    }

    public set language(value: BravoLangEnum) {
        if (BravoClientSettings.currentLang == value)
            return;

        BravoClientSettings.currentLang = value;

        this.raiseOnLanguageChanged(value);
    }

    private _zDefaultFontName: string = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    public get zDefaultFontName(): string {
        return this._zDefaultFontName;
    }

    private _nFontSize: number = 9.75;

    public get nFontSize(): number {
        return this._nFontSize;
    }

    public set nFontSize(value: number) {
        if (this._nFontSize == value) return;

        this._nFontSize = value;

        this.raiseOnFontSizeChanged(value)
    }

    public static readonly BaseDpi: wjc.Point = new wjc.Point(96, 96);

    private static _currentDpi: wjc.Point = null;

    public static get currentDpi(): wjc.Point {
        if (!this._currentDpi)
            this._currentDpi = new wjc.Point(this.BaseDpi.x * devicePixelRatio, this.BaseDpi.y * devicePixelRatio);

        return this._currentDpi;
    }

    private _resources: any;

    public get resources(): any {
        return this._resources;
    }

    public set resources(value: any) {
        if (this._resources == value) return;
        this._resources = value;
    }

    private _nMRUMaxItems: number = 8;

    public get nMRUMaxItems(): number {
        return this._nMRUMaxItems;
    }

    public set nMRUMaxItems(value: number) {
        this._nMRUMaxItems = value;
    }

    private static _fontSizes: Array<number> = null;

    public static get fontSizes(): Array<number> {
        if (this._fontSizes == null) {
            this._fontSizes = new Array();
            this._fontSizes.push(8.25);
            this._fontSizes.push(9);
            this._fontSizes.push(9.75);
            this._fontSizes.push(11);
            this._fontSizes.push(12);
        }

        return this._fontSizes;
    }

    public static get bIsDpiScaling(): Boolean {
        return this.bIsDpiXScaling || this.bIsDpiYScaling;
    }

    public static get bIsDpiXScaling(): Boolean {
        return this.BaseDpi.x != this.currentDpi.x;
    }

    public static get bIsDpiYScaling(): Boolean {
        return this.BaseDpi.y != this.currentDpi.y;
    }

    public static toBaseDpiX(pnWidthPixcels: number, pnDpiX: number) {
        if (pnWidthPixcels <= 0) return pnWidthPixcels;

        return Math.ceil(pnWidthPixcels * (this.BaseDpi.y / pnDpiX));
    }

    public static toBaseDpiY(pnHeightPixels: number, pnDpiY: number) {
        if (pnHeightPixels <= 0) return pnHeightPixels;

        return Math.ceil(pnHeightPixels * (this.BaseDpi.y / pnDpiY));
    }

    public static toCurrentDpiX(pnWidth: number) {
        if (pnWidth <= 0) return pnWidth;

        if (!this.bIsDpiXScaling) return pnWidth;

        return pnWidth * (this.currentDpi.x / this.BaseDpi.x);
    }

    public static toCurrentDpiXWithBorder(pnWidth: number) {
        if (pnWidth <= 0) return pnWidth;

        if (!this.bIsDpiXScaling) return pnWidth;

        return pnWidth * (this.BaseDpi.x / this.currentDpi.x);
    }

    public raiseOnLanguageChanged(e?) {
        this.onLanguageChanged.emit(e);
    }

    public raiseOnFontSizeChanged(e?) {
        this.onFontSizeChanged.emit(e);
    }
}