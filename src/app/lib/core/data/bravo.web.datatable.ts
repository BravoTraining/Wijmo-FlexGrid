import { WebDataColumnCollection, DataColumnChangeEventArgs, WebDataColumn } from "./bravo.web.datacolumn";
import { WebRelationCollection } from "./bravo.web.datarelation";

import { sameContent } from "../bravo.datatype.converter";
import { WebDataRow } from "./bravo.web.datarow";
import { DataRowState, TypeCode, DataRowAction } from "./enums";

import * as wjc from 'wijmo/wijmo';
import { Dictionary } from "./bravo.web.dictionary";
import { CryptoExtension } from '../crypto.extension';
import { BravoZipTool } from '../bravo.zip.tool';
import { ListChangedEventArgs, ListChangedType } from '../eventArgs/list.changed.eventArgs';
import { IBindingList } from '../interface/IBindingList';

export class WebTable extends wjc.CollectionView implements IBindingList {
    public readonly listChanged = new wjc.Event();
    protected onListChanged(e: ListChangedEventArgs) {
        this.listChanged.raise(this, e);
    }

    public readonly columnChanging = new wjc.Event();
    protected onColumnChanging(e?: DataColumnChangeEventArgs) {
        if (this.childRelations.List.length > 0) {
            this.childRelations.List.forEach(relation => {
                relation.childConstrainKey.columns.forEach(col => {
                    relation.childConstrainKey.cascadeUpdate(e.Row, e.Col.columnName, e.ProposedValue);
                })
            })
        }

        this.columnChanging.raise(this, e);
    }

    public readonly columnChanged = new wjc.Event();
    protected onColumnChanged(e?: DataColumnChangeEventArgs) {
        this.columnChanged.raise(this, e);
        // this.commitEdit();
    }

    public readonly rowChanging = new wjc.Event();
    protected onRowChanging(args: DataRowChangeEventArgs, peRow: WebDataRow, peAction: DataRowAction) {
        if (args == null)
            args = new DataRowChangeEventArgs(peRow, peAction);

        this.rowChanging.raise(this, args);

        return args;
    }

    public readonly rowChanged = new wjc.Event();
    protected onRowChanged(args: DataRowChangeEventArgs, peRow: WebDataRow, peAction: DataRowAction) {
        if (args == null)
            args = new DataRowChangeEventArgs(peRow, peAction);

        this.rowChanged.raise(this, args);

        return args;
    }

    private _childRelationCollection: WebRelationCollection;
    get childRelations(): WebRelationCollection {
        if (!this._childRelationCollection) {
            this._childRelationCollection = new WebRelationCollection(this, false);
        }

        return this._childRelationCollection;
    }

    private _parentRelationCollection: WebRelationCollection;
    get parentRelations(): WebRelationCollection {
        if (!this._parentRelationCollection) {
            this._parentRelationCollection = new WebRelationCollection(this, true);
        }

        return this._parentRelationCollection;
    }

    private _cols: WebDataColumnCollection;
    get columns(): WebDataColumnCollection {
        return this._cols;
    }

    private _rows: Array<WebDataRow>;
    public get rows(): Array<WebDataRow> {
        return this._rows;
    }

    public get row(): WebDataRow {
        if (this.currentPosition == -1) return null;

        return this.rows.find(row => row.item == this.currentItem);
    }

    private _primaryKey: Array<WebDataColumn> = null;
    public get primaryKey(): Array<WebDataColumn> {
        if (this._primaryKey == null)
            this._primaryKey = new Array();

        return this._primaryKey;
    }

    private _name: string;
    public get name(): string {
        return this._name;
    }

    public set name(val: string) {
        this._name = val;
    }

    public get currentEditItem() {
        return this._edtItem || {};
    }

    public set currentEditItem(value: any) {
        let _item = value,
            _content = sameContent(_item, this._edtClone);

        if (_content && !_content.flag) {
            let _col = this.columns.get(_content.key);
            let _e = new DataColumnChangeEventArgs(this._edtClone, _col, _content.value);

            this.onColumnChanging(_e);
            if (_e.cancel) {
                this.cancelEdit();
                return;
            }

            let _nCol = this.columns.getIndex(_content.key);
            let _nRow = this.currentPosition,
                _row: WebDataRow = null;

            if (_nRow < this.rows.length) {
                _row = this.rows[_nRow];

                if (_row.rowState == DataRowState.Unchanged) {
                    _row.originalItems = [..._row.currentItems];
                    _row.rowState = DataRowState.Modified;
                }

                if (_row) _row.currentItems[_nCol] = _content.value;
            }
            else {
                _row = new WebDataRow(this);
                _row.currentItems = new Array(this.columns.count);
                _row.currentItems[_nCol] = _content.value;
                _row.rowState = DataRowState.Added;

                this._rows.push(_row);
            }

            _e = new DataColumnChangeEventArgs(_row, _col, _content.value, _item);
            this.onColumnChanged(_e);

            this._edtClone = {};
            this._extend(this._edtClone, this._edtItem);

            this.onListChanged(new ListChangedEventArgs(ListChangedType.ItemChanged, this.currentPosition, this.currentPosition));

            // this.commitEdit();
        }
    }

    private _extendedProperties: Dictionary<string, any> = null;

    public get extendedProperties(): Dictionary<string, any> {
        if (!this._extendedProperties)
            this._extendedProperties = new Dictionary<string, any>();

        return this._extendedProperties;
    }

    public get hasErrors(): boolean {
        for (let _i = 0; _i < this.rows.length; _i++) {
            if (this.rows[_i].hasErrors)
                return true;
        }

        return false;
    }

    constructor(name?: string, sourceCollection?: any, options?) {
        super(sourceCollection, options);

        this._name = !String.isNullOrEmpty(name) ? name : "Table1";

        if (this._cols == null)
            this._cols = new WebDataColumnCollection(this);

        if (this._rows == null)
            this._rows = new Array<WebDataRow>();
    }

    public newRow(): WebDataRow {
        let _newItem = super.addNew();
        if (this._src == null) return null;

        let _i = this._src.indexOf(_newItem);
        if (_i >= 0 && _i < this._src.length) {
            this.onListChanged(new ListChangedEventArgs(ListChangedType.ItemAdded, 0, -1));
            return this.rows[_i];
        }
    }

    public acceptChanges(): void {
        let _array = this.rows.clone();
        for (let _i = 0; _i < _array.length; _i++) {
            if (_array[_i])
                _array[_i].acceptChanges();
        }
    }

    public commitRow(pRow: WebDataRow) {
        let args = this.onRowChanging(null, pRow, DataRowAction.Commit);
        this.onRowChanged(args, pRow, DataRowAction.Commit);
    }

    public newItemCreator = () => {
        let _item = {};
        for (let _col of this.columns)
            _item[_col.columnName] = _col.defaultValue;

        return _item;
    }

    public remove(item: any) {
        if (item != null) {
            let _index = this._src.indexOf(item);
            if (_index < this.rows.length) {
                let _row = this.rows[_index];
                _row.rowState = DataRowState.Deleted;
            }
        }

        super.remove(item);
    }

    public getErrors(): Array<WebDataRow> {
        let _rowsErrors = new Array<WebDataRow>();
        for (let _i = 0; _i < this.rows.length; _i++) {
            if (this.rows[_i].hasErrors)
                _rowsErrors.push(this.rows[_i]);
        }

        return _rowsErrors;
    }

    public dispose() {
        this.clear();

        if (this.columns)
            this.columns.clear();

        for (let prop in this) {
            let evt = this[prop]
            if (evt instanceof wjc.Event)
                evt.removeAllHandlers();
        }
    }

    public merge(pTable: WebTable) {
        if (pTable && pTable.itemCount <= 0) return;

        let _colKey = new Array();
        for (const _col of pTable.columns) {
            if (_colKey.length == this.primaryKey.length)
                break;

            if (this.primaryKey.findIndex(col => col.columnName == _col.columnName) != -1)
                _colKey.push(_col);
        }

        if (_colKey.length != this.primaryKey.length) return;

        for (let _item of pTable._src)
            this._mergeRow(_item);
    }

    private _mergeRow(item) {
        let _keyDst = {};
        for (const _col of this.primaryKey) {
            _keyDst[_col.columnName] = item[_col.columnName];
        }

        let _zKeyDst = JSON.stringify(_keyDst);
        let _nIndex = -1;
        let _items = [...this._src];
        for (let _n = 0; _n < _items.length; _n++) {
            let _item = _items[_n],
                _keySrc = {};
            for (let _col of this.primaryKey)
                _keySrc[_col.columnName] = _item[_col.columnName];

            if (_zKeyDst == JSON.stringify(_keySrc)) {
                _nIndex = _n;
                break;
            }
        }

        if (_nIndex != -1) {
            let _currentItem = this._src[_nIndex];
            this.editItem(_currentItem);

            for (let _key in item) {
                if (!this.columns.contains(_key) || this.columns.get(_key).readOnly)
                    continue;

                this.currentEditItem[_key] = item[_key];
            }

            this.commitEdit();
        }
    }

    public copy() {
        let _tb = new WebTable(this.name, this._src);
        _tb._rows = [...this.rows];
        return _tb;
    }

    public clear() {
        this.clearChanges();

        if (this._src != null)
            this._src.clear();

        if (this.rows)
            this.rows.clear();
    }

    onCollectionChanged(e = wjc.NotifyCollectionChangedEventArgs.reset) {
        if (this._src) {
            if (this._cols == null) this._cols = new WebDataColumnCollection(this);

            if (this._src) {
                if (e instanceof wjc.NotifyCollectionChangedEventArgs) {
                    switch (e.action) {
                        case wjc.NotifyCollectionChangedAction.Add: {
                            if (e.item == null) break;

                            for (let key in e.item) {
                                if (!this.columns.contains(key))
                                    this.columns.add(new WebDataColumn(key));
                            }

                            let _row = new WebDataRow(this, e.item);
                            for (let _col of this.columns)
                                _row.currentItems.push(e.item[_col.columnName]);

                            _row.rowState = DataRowState.Added;
                            this.rows.push(_row);

                            break;
                        }
                        case wjc.NotifyCollectionChangedAction.Change: {
                            if (e.index < 0) break;

                            for (let key in e.item) {
                                if (!this.columns.contains(key))
                                    this.columns.add(new WebDataColumn(key));
                            }

                            let _row = this.rows[e.index];

                            for (let _nCol = 0; _nCol < this.columns.count; _nCol++) {
                                let _col = this.columns[_nCol];
                                _row.originalItems[_nCol] = _row.currentItems[_nCol];
                                _row.currentItems[_nCol] = e.item[_col.columnName];
                            }

                            _row.rowState = DataRowState.Modified;

                            break;
                        }

                        case wjc.NotifyCollectionChangedAction.Reset: {
                            if (this._rows == null)
                                this._rows = new Array();

                            this._rows.clear();

                            for (const _item of this.items) {
                                let _row = new WebDataRow(this, _item);
                                _row.rowState = DataRowState.Unchanged;

                                for (let _nCol = 0; _nCol < this.columns.count; _nCol++) {
                                    let _col = this.columns[_nCol];
                                    _row.currentItems[_nCol] = _item[_col.columnName];
                                }

                                this._rows.push(_row);
                            }

                            break;
                        }
                    }
                }
            }
        }

        super.onCollectionChanged(e);
    }

    implementsInterface(interfaceName: string) {
        if (interfaceName == 'IBindingList')
            return true;

        return super.implementsInterface(interfaceName);
    }

    getCollection() {
        return this;
    }

    public writeJson() {
        if (this.columns.length < 1 || this.rows.length < 1 || this.items.length < 1)
            return null;

        let _array = new Array();
        for (const _item of this.items) {
            _array.push(_item);
        }

        return JSON.stringify(_array);
    }

    public static async readForm(pTable: WebTable, data: any, pbDebug: boolean = false) {
        if (!data) return;
        let _cols = data.Columns;

        if (_cols instanceof Array) {
            for (const _col of _cols) {
                if (!pTable.columns.contains(_col.ColumnName))
                    pTable.columns.add(new WebDataColumn(_col.ColumnName, _col.DataType));
            }
        }

        let _rows = data.Rows;

        if (wjc.isString(_rows)) {
            let _buff = CryptoExtension.stringBase64toArrayBuff(_rows);
            if (!_buff) return;

            let _zipFile = await BravoZipTool.open(_buff);
            if (!_zipFile) return;

            let _data = await _zipFile.readEntry('Rows');
            if (!_data) return;

            _rows = JSON.parse(_data);
        }

        if (_rows instanceof Array) {
            let _items = new Array<any>();

            for (const _row of _rows) {
                let item = {};
                let _dr = new WebDataRow(pTable, item);
                for (let _nCol = 0; _nCol < _cols.length; _nCol++) {
                    let _col = _cols[_nCol];

                    let _val = _row.CurrentItems[_nCol];
                    if (_col.DataType == TypeCode.DateTime) {
                        _val = Date.asDate(_val);
                        _row.CurrentItems[_nCol] = _val;
                    }

                    item[_col.ColumnName] = _val;
                }

                _dr.currentItems = [..._row.CurrentItems];
                _dr.rowState = _row.RowState;

                _items.push(item);

                pTable.rows.push(_dr);
            }

            if (pTable.sourceCollection && pTable.sourceCollection.length > 0)
                _items.forEach(item => pTable.sourceCollection.push(item));
            else
                pTable.sourceCollection = _items;
        }
    }
}

export class DataRowChangeEventArgs extends wjc.EventArgs {
    public readonly row: WebDataRow;
    public readonly action: DataRowAction;

    constructor(row: WebDataRow, action: DataRowAction) {
        super();
        this.row = row;
        this.action = action;
    }
}
