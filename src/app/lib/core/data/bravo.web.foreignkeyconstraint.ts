import { WebDataColumn } from "./bravo.web.datacolumn";
import { WebTable } from "./bravo.web.datatable";
import { MessageContstants } from "../common/message.constants";
import { Rule } from "./enums";

import * as wjc from 'wijmo/wijmo';

export class ForeignKeyConstraint {
    private _parentKey: DataKey;
    private _childKey: DataKey;
    private _contrainName: string;
    private _updateRule: Rule;
    private _deleteRule: Rule;

    get childKey(): DataKey {
        return this._childKey;
    }

    get columns(): WebDataColumn[] {
        return this._childKey.toArray();
    }

    get table(): WebTable {
        return this._childKey.Table;
    }

    get childColumnsName(): string[] {
        return this._childKey.getColumnNames();
    }

    get parentKey(): DataKey {
        return this._parentKey;
    }

    get relatedColumns(): WebDataColumn[] {
        return this._parentKey.toArray();
    }

    get relatedTable(): WebTable {
        return this._parentKey.Table;
    }

    get updateRule(): Rule {
        return this._updateRule;
    }

    set updateRule(value) {
        this._updateRule = value;
    }

    get deleteRule(): Rule {
        return this._deleteRule;
    }

    set deleteRule(value) {
        this._deleteRule = value;
    }

    constructor(name: string, parentColumns: WebDataColumn[], childColumns: WebDataColumn[]) {
        this.create(name, parentColumns, childColumns);
    }

    create(name: string, parentColumns: WebDataColumn[], childColumns: WebDataColumn[]): any {
        if (parentColumns.length != 0 && childColumns.length != 0) {
            if (parentColumns.length != childColumns.length) {
                throw new Error();
            }

            this._parentKey = new DataKey(parentColumns, true);
            this._childKey = new DataKey(childColumns, true);
            this._contrainName = name;
        }
    }

    canEnableConstraint() {
        let childArray = this.childKey.Table.items.map(x => x['id']),
            parentArray = this.parentKey.Table.items.map(x => x['Id']);
        let uniqueValues = childArray.filter((v, i, a) => a.indexOf(v) === i),
            uniqueValues2 = parentArray.filter((v, i, a) => a.indexOf(v) === i);

        for (var i = 0; i < uniqueValues.length; i++) {
            if (!uniqueValues2.includes(uniqueValues[i])) {
                return false;
            }
        }

        return true;
    }

    cascadeUpdate(row: any, col: any, value: any) {
        switch (this.updateRule) {
            case Rule.None:
                break;
            case Rule.Cascade:
                let _val = row[col];
                let _rows = this.table.sourceCollection;
                let _keyValues = this.getKeyValues(this.parentKey, row);

                _rows.forEach((row, i) => {
                    let _keyChildValues = this.getKeyValues(this.childKey, row);

                    if (arraysIdentical(_keyValues, _keyChildValues)) {
                        row['id'] = value;
                    }
                });

                this.table.refresh();
                break;
        }
    }

    private getKeyValues(key: DataKey, val: any) {
        let _cols = key.toArray();
        let array = new Array(_cols.length);

        _cols.forEach((col, i) => {
            array[i] = val[col.columnName];
        });

        return array;
    }

    checkConstraint(row: any, action: wjc.NotifyCollectionChangedAction) {
        if (action != wjc.NotifyCollectionChangedAction.Change) {
            return true;
        }

        let _keyValues = this.getKeyValues(this.childKey, row);
        let _rows = this.relatedTable.sourceCollection;

        if (_rows) {
            for (let key in _rows) {
                let _key = this.getKeyValues(this.parentKey, _rows[key]);
                if (!arraysIdentical(_keyValues, _key)) {
                    return false;
                }
            }
        }

        /* _rows.forEach((row, i) => {
            let _key = this.getKeyValues(this.parentKey, row);
            if (!arraysIdentical(_keyValues, _key)) {
                return false;
            }
        }); */

        return true;
    }

    hasKeyChanged(row: number, key: DataKey) {
    }

    // handler ForeignKeyConstraint
    getParentRow(parentKey: DataKey, childKey: DataKey, row: any) {
        let _keyValues: Array<any> = new Array<any>();
        childKey.getColumnNames().forEach(col => {
            _keyValues.push(row[col]);
        });

        //this.relatedTable.items.
    }
}

const maxColumns: number = 32;
export class DataKey {
    constructor(columns: Array<WebDataColumn>, copyColumns: any) {
        if (!columns) {
            throw new Error(String.format(MessageContstants.ArgumentNullError, "columns"));
        }

        if (columns.length == 0 || columns.length > maxColumns) {
            throw new Error();
        }

        if (copyColumns) {
            this.columns = new Array<WebDataColumn>(columns.length);
            for (let n = 0; n < columns.length; n++) {
                this.columns[n] = columns[n];
            }
        }
        else {
            this.columns = columns;
        }
    }

    private readonly columns: Array<WebDataColumn>;

    get Table(): WebTable {
        return this.columns[0].table;
    }

    columnsEqual(key: DataKey) {
        return DataKey.columnsEqual(this.columns, key.columns);
    }

    private static columnsEqual(column1: WebDataColumn[], column2: WebDataColumn[]) {
        if (column1 === column2) {
            return true;
        }
        else if (!column1 || !column2) {
            return false;
        }
        else if (column1.length != column2.length) {
            return false;
        }
        else {
            for (let _n1 = 0; _n1 < column1.length; _n1++) {
                let bCheck = false;
                for (let _n2 = 0; _n2 < column2.length; _n2++) {
                    if (column1[_n1] != column2[_n2]) {
                        bCheck = true;
                        break;
                    }
                }

                if (bCheck) {
                    return false;
                }
            }

            return true;
        }
    }

    getColumnNames(): Array<string> {
        let values = new Array<string>(this.columns.length);
        for (let n = 0; n < this.columns.length; n++) {
            values[n] = this.columns[n].columnName;
        }

        return values;
    }

    toArray(): Array<WebDataColumn> {
        let values = new Array<WebDataColumn>(this.columns.length);
        for (let n = 0; n < this.columns.length; n++) {
            values[n] = this.columns[n];
        }

        return values;
    }
}

function arraysIdentical(a, b) {
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] != b[i]) return false;
    }
    return true;
};