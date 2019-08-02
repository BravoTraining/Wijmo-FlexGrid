import { isString } from "wijmo/wijmo";

export class Dictionary<K, T> {
    private _data: Array<{ key: any, value: any }>;
    // private _length: number;

    constructor(capacity?: number) {
        if (!capacity) capacity = 0;
        this._data = new Array<{ key: K, value: T }>(capacity);
        // this._length = capacity;
    }

    public get(key) {
        let _val = this._data.find(x => x && x.key == key);
        if (_val != null) return _val;

        if (Number.isNumber(key)) {
            if (key < 0 || key > this._data.length)
                throw new Error(`Index outside the range`);

            return this._data[key];
        }

        if (isString(key)) {
            let _i = this._data.findIndex(x => x && x.key === key);
            if (_i >= 0 && _i < this._data.length)
                return this._data[_i];
        }
    }

    public getValue(key): T {
        if (!this.containsKey(key)) return null;
        return this.get(key).value;
    }

    public set(key, value) {
        let _nIndex = this.keys.findIndex(x => x && x.key == key);
        if (_nIndex >= 0 && _nIndex < this._data.length)
            this._data[_nIndex] = value;
    }

    public add<K, T>(key: K, value: T) {
        if (this.containsKey(key))
            throw new Error("Exists key");

        this._data.push({ key, value });
    }

    public remove<K>(key: K) {
        if (this.containsKey(key)) {
            let _index = this._data.findIndex(x => x && x.key === key);
            this._data.splice(_index, 1);
            return true;
        }

        return false;
    }

    public clear() {
        while (this._data.length) {
            this._data.pop();
        }
    }

    public get keys(): any[] {
        if (this._data) {
            let _keys = [];
            this._data.forEach(x => { if (x.key != undefined && x.key != null) _keys.push(x.key) });
            return _keys;
        }
    }

    public get values(): T[] {
        if (this._data) {
            let _values = [];
            this._data.forEach(x => _values.push(x.value));
            return _values;
        }
    }

    public get count(): number {
        return this._data.length;
    }

    public containsKey<K>(key: K): boolean {
        return this._data.findIndex(x => x && x.key === key) != -1;
    }
}