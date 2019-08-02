import { WebTable } from "./bravo.web.datatable";
import { getType } from "../bravo.datatype.converter";
import { TypeCode } from "./enums";
import * as wjc from "wijmo/wijmo";
import { WebDataRow } from "./bravo.web.datarow";
import { SensitivityEnum } from "../extensions.method";
import { Dictionary } from "./bravo.web.dictionary";

export class WebDataColumn {
    private _table: WebTable;

    public get table(): WebTable {
        return this._table;
    };

    columnName: string;
    dataType: TypeCode;
    maxLength: number;
    defaultValue: any;
    errors: number = 0;

    private _bAllowDBNull = true;

    public get allowDBNull(): boolean {
        return this._bAllowDBNull;
    }

    public set allowDBNull(value: boolean) {
        this._bAllowDBNull = value;
    }

    private _caption: string = null;

    public get caption(): string {
        return this._caption;
    }

    public set caption(value: string) {
        this._caption = value;
    }

    readOnly: boolean = false;

    private _extendedProperties: Dictionary<string, any> = null;

    public get extendedProperties(): Dictionary<string, any> {
        if (!this._extendedProperties)
            this._extendedProperties = new Dictionary<string, any>();

        return this._extendedProperties;
    }

    constructor(name: string, type?: TypeCode) {
        this.columnName = name;
        this.dataType = type || TypeCode.String;
    }

    setTable(table: WebTable) {
        if (this._table != table) {
            this._table = table;
        }
    }
}

export class WebDataColumnCollection extends wjc.ObservableArray {
    constructor(table: WebTable) {
        super();

        this._table = table;

        if (table && table.items && table.items.length > 0) {
            let _row = table.items[0];

            let _type: TypeCode, _val: any, _col: WebDataColumn;

            for (let key in _row) {
                _val = _row[key];
                _type = getType(_val);

                _col = new WebDataColumn(key, _type);
                _col.setTable(table);

                if (!this.includes(_col))
                    this.push(_col);
            }
        }
    }

    public contains(name: string): boolean {
        if (this.find(col => String.compare(col.columnName, name, SensitivityEnum.Base) == 0)) {
            return true;
        }
        return false;
    }

    public add(column: WebDataColumn): WebDataColumn;
    public add(column: string): WebDataColumn;
    public add(column: string, type: number): WebDataColumn;
    public add(column: any, type?: number): WebDataColumn {
        if (column instanceof WebDataColumn) {
            this.push(column);

            if (type) column.dataType = type;

            column.setTable(this._table);
            return column;
        }
        else if (typeof column === 'string') {
            let _dataColumn = new WebDataColumn(column);
            _dataColumn = this.add(_dataColumn);

            if (type) _dataColumn.dataType = type;

            _dataColumn.setTable(this._table);
            return _dataColumn;
        }
    }

    public get(column): WebDataColumn {
        return this.find(col => String.compare(col.columnName, column, SensitivityEnum.Base) == 0);
    }

    public getIndex(column): number {
        return this.findIndex(col => String.compare(col.columnName, column, SensitivityEnum.Base) == 0);
    }

    public get count(): number {
        return this.length;
    }

    private _table: WebTable;

}

export class DataColumnChangeEventArgs {
    constructor(row: WebDataRow, col: WebDataColumn, value: any, item?: any, cancel: boolean = false) {
        this._row = row;
        this._col = col;
        this._proposedValue = value;
        this._cancel = cancel;
        this._item = item;
    }

    private _item: any;

    public get Item(): any {
        return this._item;
    }


    private _col: WebDataColumn;
    get Col(): WebDataColumn {
        return this._col;
    }

    private _row: WebDataRow;
    get Row(): WebDataRow {
        return this._row;
    }

    private _proposedValue: any;
    get ProposedValue(): any {
        return this._proposedValue;
    }

    set ProposedValue(value) {
        this._proposedValue = value;
    }

    private _cancel: any;
    public get cancel(): boolean {
        return this._cancel;
    }

    public set cancel(val: boolean) {
        this._cancel = val;
    }
}