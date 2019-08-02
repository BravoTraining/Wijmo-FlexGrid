import { ObservableArray, NotifyCollectionChangedEventArgs, isString } from 'wijmo/wijmo';
import { WebTable } from './bravo.web.datatable';
import { Dictionary } from './bravo.web.dictionary';
import { SensitivityEnum } from '../extensions.method';
import { BravoXmlHelper } from './bravo.xml.helper';
import { IWebSet } from '../interface/IWebSet';

export class WebSet implements IWebSet {
    private _bInitProgress = false;

    public get isInitialized(): boolean {
        return this._bInitProgress;
    }

    private _tables: WebTableCollection = null;

    public get tables(): WebTableCollection {
        return this._tables;
    }

    private _extendedProperties: Dictionary<string, any> = null;

    public get extendedProperties(): Dictionary<string, any> {
        if (!this._extendedProperties)
            this._extendedProperties = new Dictionary<string, any>();

        return this._extendedProperties;
    }

    constructor() {
        this._tables = new WebTableCollection();
    }

    public beginInit() {
        this._bInitProgress = true;
    }

    public clear() {
        for (let _n = 0; _n < this.tables.length; _n++)
            this.tables[_n].clear();
    }

    public dispose() {
        for (let _n = 0; _n < this.tables.length; _n++)
            this.tables[_n].dispose();
    }

    public endInit() {
        this._bInitProgress = false;
    }

    public static async readForm(pDataSet: WebSet, data: any) {
        if (!data) return;
        let _tables = data.Tables;

        if (_tables instanceof Array && _tables.length > 0) {
            let _tb: any = null, _stb = null, _tbName: string;
            for (let _n = 0; _n < _tables.length; _n++) {
                _tb = _tables[_n];
                _stb = pDataSet.tables[_n];
                _tbName = _tb.TableName;

                if (_stb && _tbName) _stb.name = _tbName;

                if (_stb instanceof WebTable) {
                    await WebTable.readForm(_stb, _tb);
                }
                else {
                    if (!_tbName) _tbName = `Table${_n + 1}`;

                    let _wt = new WebTable(_tbName)
                    await WebTable.readForm(_wt, _tb);
                    pDataSet.tables.push(_wt);
                }
            }
        }
    }

    public writeJson(pbFormat: boolean = false) {
        if (this.tables.length < 0)
            return null;

        let _tbCollection = new Array<WebTable>();
        for (const _tb of this.tables) {
            if (_tb instanceof WebTable && _tb.columns.length > 0 && _tb.rows.length > 0) {
                _tbCollection.push(_tb);
            }
        }

        let _obj = {};
        for (const _tb of _tbCollection) {
            let _item = JSON.parse(_tb.writeJson())
            _obj[_tb.name] = _item;
        }

        let _zJson = pbFormat ? JSON.stringify(_obj, null, 2) : JSON.stringify(_obj);
        let _enc = new TextEncoder();

        return _enc.encode(_zJson);
    }

    public writeXml() {
        let _xml = BravoXmlHelper.writeDataSet(this);
        let _enc = new TextEncoder();

        return _enc.encode(_xml);
    }

    public implementsInterface(interfaceName: string) {
        return interfaceName == 'IWebSet';
    }
}

/* export class BravoCollection extends ArrayBase {
    private _updating = 0;
    private _collectionChanged = new EventEmitter();

    constructor() {
        super();
    }

    push(item: any) {
        let _rv = super.push(item);
        if (!this._updating)
            this._raiseCollectionChanged(NotifyCollectionChangedAction.Add, item, _rv - 1);

        return _rv;
    }

    pop() {
        let _item = super.pop();
        this._raiseCollectionChanged(NotifyCollectionChangedAction.Remove, _item, this.length);
        return _item;
    }

    splice<T>(index: number, count: number, item?: T): T {
        let _rv;
        if (count && item) {
            _rv = super.splice(index, count, item);
            if (count == 1)
                this._raiseCollectionChanged(NotifyCollectionChangedAction.Change, item, index);
            else
                this._raiseCollectionChanged();

            return _rv;
        }
        else if (item) {
            _rv = super.splice(index, 0, item);
            this._raiseCollectionChanged(NotifyCollectionChangedAction.Add, item, index);

            return _rv;
        }
        else {
            _rv = super.splice(index, count);
            if (count == 1)
                this._raiseCollectionChanged(NotifyCollectionChangedAction.Remove, _rv[0], index);
            else
                this._raiseCollectionChanged();

            return _rv;
        }
    }

    slice<T>(begin?: number, end?: number) {
        return super.slice(begin, end);
    }

    find<T>(predicate?, thisArg?: any) {
        return super.find(predicate, thisArg);
    }

    indexOf(searchElement: any, fromIndex?: number) {
        return super.indexOf(searchElement, fromIndex);
    }

    insert(index: number, item: any) {
        this.splice(index, 0, item);
    }

    removeAt(index: number) {
        this.splice(index, 1);
    }

    clear() {
        if (this.length !== 0) {
            this.length = 0;
            this._raiseCollectionChanged();
        }
    }

    get isUpdating() {
        return this._updating > 0;
    }

    onCollectionChanged(e = NotifyCollectionChangedEventArgs.reset) {
        if (!this.isUpdating) {
            this._collectionChanged.emit(e);
        }
    }

    private _raiseCollectionChanged(action?: NotifyCollectionChangedAction, item?: any, index?: number) {
        if (!this.isUpdating) {
            var e = new NotifyCollectionChangedEventArgs(action, item, index);
            this.onCollectionChanged(e);
        }
    }
} */

class WebTableCollection extends ObservableArray {
    public add(table: any) {
        if (isString(table)) {
            let _tb = new WebTable(table);
            this.push(_tb);
            return _tb;
        }

        if (table instanceof WebTable) {
            let _index = this.findIndex(x => x.name == table.name)
            if (_index != -1)
                this.removeAt(_index);

            this.push(table);
            return table;
        }
    }

    public contains(pzTableName: string): boolean {
        return this.find(t => String.compare(t.name, pzTableName, SensitivityEnum.Base) == 0) ? true : false;
    }

    public get(pzTableName: string): WebTable {
        return this.find(t => String.compare(t.name, pzTableName, SensitivityEnum.Base) == 0);
    }

    public copyTo(pTables: WebTable[], index: number = 0) {
        if (!pTables) throw new Error('Arrgument null');
        if (index < 0) throw new Error('Arrgument out of range');

        if (pTables.length - index < this.length)
            throw new Error('Invalid offset length');

        for (let _i = 0; _i < this.length; _i++)
            pTables[index + _i] = this[_i];
    }
}