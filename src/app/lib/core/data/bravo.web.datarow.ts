import { DataRowState } from "./enums";
import { WebTable } from "./bravo.web.datatable";
import * as wjc from "wijmo/wijmo";
import { WebDataColumn, WebDataColumnCollection } from "./bravo.web.datacolumn";
import { WebDataError } from "./bravo.web.dataerror";

export class WebDataRow {
    public readonly item: any = null;

    constructor(table: WebTable, item?: any) {
        this._table = table;
        this._columns = table.columns;
        this.item = item;
    }

    private readonly _columns: WebDataColumnCollection;

    private _rowState: DataRowState = DataRowState.Unchanged;

    public get rowState(): DataRowState {
        return this._rowState;
    }

    public set rowState(state: DataRowState) {
        this._rowState = state;
    }

    private _error: WebDataError;

    public get hasErrors(): boolean {
        return this._error ? this._error.hasErrors : false;
    }

    private _table: WebTable = null;

    public get table(): WebTable {
        return this._table;
    }

    private _currentItems: Array<any> = null;

    public get currentItems(): Array<any> {
        if (!this._currentItems)
            this._currentItems = new Array<any>();

        return this._currentItems;
    }

    public set currentItems(value: Array<any>) {
        this._currentItems = value;
    }

    private _originalItems: Array<any> = null;

    public get originalItems(): Array<any> {
        if (!this._originalItems)
            this._originalItems = new Array<any>();

        return this._originalItems;
    }

    public set originalItems(value: Array<any>) {
        this._originalItems = value;
    }

    public get defaultItems(): Array<any> {
        if (!this._columns || this._columns.count < 1)
            return;

        let _defaultItems = new Array<any>();

        for (let _col of this._columns)
            _defaultItems.push(_col.defaultValue);

        return _defaultItems;
    }

    public getValue(key: any, pVersion: DataRowVersion = DataRowVersion.Current) {
        if (wjc.isString(key))
            key = this._columns.getIndex(key);
        else if (key instanceof WebDataColumn)
            key = this._columns.indexOf(key);

        if (key >= 0 && key < this._columns.count) {
            if (pVersion == DataRowVersion.Current)
                return this.currentItems[key];

            if (pVersion == DataRowVersion.Original)
                return this.originalItems[key];

            if (pVersion == DataRowVersion.Default)
                return this.defaultItems[key];
        }

        return null;
    }

    public isNull(column, pVersion: DataRowVersion = DataRowVersion.Current) {
        return this.getValue(column, pVersion) ? false : true;
    }

    public setValue(key: any, value: any) {
        let _nIndex: number = -1, _zColumnName: string = null;

        if (wjc.isString(key)) {
            _nIndex = this._columns.getIndex(key);
            _zColumnName = key;
        }
        else if (wjc.isNumber(key) && key >= 0 && key < this._columns.count) {
            _nIndex = key;
            _zColumnName = this._columns[key].columnName;
        }

        if (_nIndex >= 0 && _nIndex < this._columns.count) {
            // let _e = new DataColumnChangeEventArgs(this, this._columns[_nIndex], value);
            // this._table.onColumnChanging(_e);

            this.currentItems[_nIndex] = value;
            if (this._rowState != DataRowState.Modified)
                this._rowState = DataRowState.Modified;

            let _currentItem = this.table.currentItem;
            if (_currentItem) {
                this.table.editItem(_currentItem);

                _currentItem[_zColumnName] = value;
                this.table.currentEditItem = _currentItem;
            }

            // if (_e != null)
            //     this._table.onColumnChanged(_e);

            // this._table.onListChanged(new ListChangedEventArgs(ListChangedType.ItemChanged, this._table.currentPosition,
            //     this._table.currentPosition));

            // this.table.commitEdit();
        }
    }

    public hasVersion(pVersion: DataRowVersion): boolean {
        switch (pVersion) {
            case DataRowVersion.Original:
                if (this._originalItems != null && this._originalItems.length > 0)
                    return true;

                break;
            case DataRowVersion.Current:
                if (this._currentItems != null && this._currentItems.length > 0)
                    return true;

                break;
            case DataRowVersion.Default:
                if (this.defaultItems != null && this.defaultItems.length > 0)
                    return true;

                break;
        }

        return false;
    }

    public setColumnError(columnIndex: number, pzError: string);
    public setColumnError(columnName: string, pzError: string);
    public setColumnError(column: WebDataColumn, pzError: string);
    public setColumnError(pColumn: any, pzError: string) {
        if (Number.isNumber(pColumn))
            pColumn = this._columns[pColumn];
        else if (wjc.isString(pColumn))
            pColumn = this._columns.get(pColumn);

        if (pColumn instanceof WebDataColumn) {
            if (!this._error)
                this._error = new WebDataError();

            if (this.getColumnError(pColumn) != pzError)
                this._error.setColumnError(pColumn, pzError);
        }
    }

    public getColumnError(columnIndex: number);
    public getColumnError(columnIndex: string);
    public getColumnError(column: WebDataColumn);
    public getColumnError(pColumn: any): string {
        if (Number.isNumber(pColumn))
            pColumn = this._columns[pColumn];
        else if (wjc.isString(pColumn))
            pColumn = this._columns.get(pColumn);

        if (pColumn instanceof WebDataColumn) {
            if (!this._error)
                this._error = new WebDataError();

            return this._error.getColumnError(pColumn);
        }

        return String.empty;
    }

    public clearError(column?: WebDataColumn) {
        if (this._error)
            this._error.clear(column);
    }

    public getColumnsInError(): Array<WebDataColumn> {
        if (this._error)
            return this._error.getColumnsInError();
    }

    public acceptChanges(): void {
        if (this.rowState != DataRowState.Detached && this.rowState != DataRowState.Deleted && this._columns.count > 0) {
            for (let _i = 0; _i < this._columns.count; _i++) {
                this.originalItems[_i] = this.currentItems[_i];
            }

            this.rowState = DataRowState.Unchanged;
        }

        this._table.commitRow(this);
    }
}

export enum DataRowVersion {
    Original = 256,
    Current = 512,
    Proposed = 1024,
    Default = 1536
}