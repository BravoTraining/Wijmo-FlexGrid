import { EventEmitter, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { IBravoControlBase } from './interface/IBravoControlBase';
import { FormGroup, ControlValueAccessor } from '@angular/forms';

import * as wjc from 'wijmo/wijmo';

import { Subject } from 'rxjs';
import { AnchorStyles } from './enums';
import { BravoBinding } from './components/bravo.binding';
import { BravoBindingSource } from './components/bravo.binding';

export class BravoControlBase extends wjc.Control implements IBravoControlBase, OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
    public readonly onSizeChanged = new EventEmitter();
    public readonly onPropertyChanged = new EventEmitter();

    protected ngUnsubscribe = new Subject();

    public readonly onTextChanged = new wjc.Event();

    // @HostBinding("style.cursor") cursor: Cursors;

    //#region Properties

    private _anchor: AnchorStyles = AnchorStyles.Top | AnchorStyles.Left;

    public get anchor(): AnchorStyles {
        return this._anchor;
    }

    public set anchor(value: AnchorStyles) {
        this._anchor = value;
    }

    private _size: wjc.Size = new wjc.Size();

    public get size(): wjc.Size {
        if (!this._size)
            this._size = new wjc.Size(this.hostElement.offsetWidth, this.hostElement.offsetHeight);

        return this._size;
    }

    public set size(value: wjc.Size) {
        if (this._size.equals(value)) return;

        this._size = value;
        this.onSizeChanged.next(this._size);
    }

    public get width(): number {
        return this.hostElement ? this.hostElement.offsetWidth : 0;
    }

    public set width(value: number) {
        if (!this.hostElement || this.width == value)
            return;

        this.hostElement.style.width = `${value}px`;
    }

    public get height(): number {
        return this.hostElement ? this.hostElement.offsetHeight : 0;
    }

    public set height(value: number) {
        if (!this.hostElement || this.height == value)
            return;

        this.hostElement.style.height = `${value}px`;
    }

    public get top(): number {
        return this.hostElement ? this.hostElement.offsetTop : 0;
    }

    public set top(value: number) {
        if (!this.hostElement) return;

        let _css = getComputedStyle(this.hostElement);
        if (_css.position == 'absolute' || _css.position == 'sticky' || _css.position == 'fixed')
            this.hostElement.style.top = value + 'px';
        else
            this.hostElement.style.marginTop = value + 'px';
    }

    public get bottom(): number {
        return this.hostElement ? this.hostElement.offsetTop + this.hostElement.offsetHeight : 0;
    }

    public set bottom(value: number) {
        if (!this.hostElement) return;

        let _css = getComputedStyle(this.hostElement);
        if (_css.position == 'absolute')
            this.hostElement.style.bottom = value + 'px';
        else
            this.hostElement.style.marginBottom = value + 'px';
    }

    public get left(): number {
        return this.hostElement ? this.hostElement.offsetLeft : 0;
    }

    public set left(value: number) {
        if (!this.hostElement) return;

        let _css = getComputedStyle(this.hostElement);
        if (_css.position == 'absolute')
            this.hostElement.style.left = value + 'px';
        else
            this.hostElement.style.marginLeft = value + 'px';
    }

    public get right(): number {
        return this.hostElement ? this.hostElement.offsetLeft + this.hostElement.offsetWidth : 0;
    }

    public set right(value: number) {
        if (!this.hostElement) return;

        let _css = getComputedStyle(this.hostElement);
        if (_css.position == 'absolute')
            this.hostElement.style.right = value + 'px';
        else
            this.hostElement.style.marginRight = value + 'px';
    }

    private _col: number = 0;

    public get col(): number {
        return this._col;
    }

    public set col(val: number) {
        this._col = val;
    }

    private _row: number = 0;

    public get row(): number {
        return this._row;
    }

    public set row(val: number) {
        this._row = val;
    }

    private _columnSpan: number = 1;

    public get columnSpan(): number {
        return this._columnSpan;
    }

    public set columnSpan(val: number) {
        this._columnSpan = val;
    }

    private _rowSpan: number = 1;

    public get rowSpan(): number {
        return this._rowSpan;
    }

    public set rowSpan(val: number) {
        this._rowSpan = val;
    }

    public name: string = null;

    private _text: string = null;

    public get text(): string {
        return this._text || String.empty;
    }

    public set text(value: string) {
        if (this._text == value) return;
        this._text = value;

        this.onTextChanged.raise(this, wjc.EventArgs.empty);
    }

    public value: any = null;

    private _tag = null;

    public get tag(): any {
        return this._tag;
    }

    public set tag(value: any) {
        this._tag = value;
    }

    public get enabled(): boolean {
        return !this.isDisabled;
    }

    public set enabled(value: boolean) {
        this.isDisabled = !value;
    }

    private _dataBinding: BravoBinding;

    public get dataBinding(): BravoBinding {
        if (!this._dataBinding)
            this._dataBinding = new BravoBinding();

        return this._dataBinding;
    }

    public set dataBinding(val: BravoBinding) {
        if (this._dataBinding != val)
            this._dataBinding = val;
    }

    protected _visible: boolean = true;

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        if (this._visible == value) return;
        this._visible = value;
        this.hostElement.style.display = !this._visible ? 'none' : 'block';
    }

    protected _controls: any = null;

    public get controls(): any {
        if (!this._controls)
            this._controls = new wjc.ObservableArray();

        return this._controls;
    }

    public parentForm: FormGroup;
    public parent: BravoControlBase;
    public bInitControl = false;
    public style: any = {};

    private _dock: DockStyle = DockStyle.None;

    public get dock(): DockStyle {
        return this._dock;
    }

    public set dock(value: DockStyle) {
        if (value == DockStyle.Fill) {
            this.hostElement.style.width = '100%';
            this.hostElement.style.height = '100%';
        }

        this._dock = value;
    }

    private _bAllowUsingEnterAsTabKey: boolean = true;

    public get bAllowUsingEnterAsTabKey(): boolean {
        return this._bAllowUsingEnterAsTabKey;
    }

    public set bAllowUsingEnterAsTabKey(value: boolean) {
        this._bAllowUsingEnterAsTabKey = value;
    }

    private _bAllowUsingUpDownAsTabKey: boolean = true;

    public get bAllowUsingUpDownAsTabKey(): boolean {
        return this._bAllowUsingUpDownAsTabKey;
    }

    public set bAllowUsingUpDownAsTabKey(value: boolean) {
        this._bAllowUsingUpDownAsTabKey = value;
    }

    //#endregion Properties

    constructor(element: any, options?: any, invalidateOnResize?: boolean) {
        super(element, options, invalidateOnResize);
        this.created();
    }

    created() {
        if (this.hostElement)
            wjc.addClass(this.hostElement, 'bravo-control');
    }

    public ngOnInit(): void {
    }

    public ngAfterViewInit(): void {
    }

    public ngOnDestroy(): void {
        try {

            this.ngUnsubscribe.next();
            this.ngUnsubscribe.complete();

            if (this._controls) {
                for (let _ctrl of this._controls) {
                    if (_ctrl instanceof BravoControlBase)
                        _ctrl.ngOnDestroy();
                    else if (_ctrl instanceof wjc.Control && _ctrl.hostElement)
                        _ctrl.dispose();
                }

                this._controls.clear()
                this._controls = null;
            }

            if (this.hostElement)
                this.dispose();
        }
        catch (_ex) {
            console.log(_ex, this._controls);
        }
    }

    protected addControl(pControl: any, pnIndex: number) {
    }

    protected removeControl(pControl: any) {
    }

    public implementsInterface(interfaceName: string): boolean {
        return interfaceName == 'IBravoControlBase';
    }

    // public static updateBinding(binding: BravoBinding) {
    //     let _bs = binding.dataSource;
    //     if (_bs instanceof BravoBindingSource) {
    //         _bs.currencyManager.bindings.push(binding);
    //         binding.updateIsBinding();
    //     }
    // }

    //#region ControlValueAccessor

    propagateChange = (_: any) => { };

    writeValue(value: any): void {
        if (value) this.value = value;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
    }

    //#endregion ControlValueAccessor
}

export enum DockStyle {
    None = 0,
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
    Fill = 5
}