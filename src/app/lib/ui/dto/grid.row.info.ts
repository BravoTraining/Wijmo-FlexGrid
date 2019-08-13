import * as wjg from "wijmo/wijmo.grid";
import { BravoWebGrid } from '../controls/bravo.web.grid';
import { WebDataRow } from '../../core/core';

export class GridRowInfo {
    public readonly row: wjg.Row = null;

    constructor(row: wjg.Row) {
        this.row = row;
    }

    private _bNodeRetrieved: boolean = false;

    private _node: wjg.GroupRow = null;

    public get node(): wjg.GroupRow {
        if (this._node == null && !this._bNodeRetrieved) {
            let _grid = this.row.grid;
            if (_grid instanceof BravoWebGrid) {
                this._node = this.bIsNode ? this.row :
                    _grid.getParentNode(this.row);
                this._bNodeRetrieved = true;
            }
        }

        return this._node;
    }

    private _bDataRowRetrieved: boolean = false;

    private _dataRow: WebDataRow = null;

    public get dataRow(): WebDataRow {
        if (this.row != null && !this._bDataRowRetrieved) {
            let _grid = this.row.grid;
            if (_grid instanceof BravoWebGrid) {
                this._dataRow = _grid.getDataRow(this.nRowIndex);
                this._bDataRowRetrieved = true;
            }
        }

        return this._dataRow;
    }

    private _bIsNode: boolean = null;

    public get bIsNode(): boolean {
        if (this.row != null && this._bIsNode == null)
            this._bIsNode = this.row instanceof wjg.GroupRow;

        return this._bIsNode;
    }

    private _bIsHidden: boolean = null;

    public get bIsHidden(): boolean {
        if (this.row != null && this._bIsHidden == null) {
            let _grid = this.row.grid;
            if (_grid instanceof BravoWebGrid)
                this._bIsHidden = _grid.isHiddenRow(this.nRowIndex);
        }

        return this._bIsHidden;
    }

    private _nRowIndex: number = null;

    public get nRowIndex(): number {
        if (this.row != null && this._nRowIndex == null)
            this._nRowIndex = this.row.index;

        return this._nRowIndex;
    }

    private _nDataIndex: number = null;

    public get nDataIndex(): number {
        if (this.row != null && this._nDataIndex == null) {
            let _grid = this.row.grid;
            if (_grid instanceof BravoWebGrid)
                this._nDataIndex = _grid.getDataIndex(this.nRowIndex);
        }

        return this._nDataIndex == null ? -1 : this._nDataIndex;
    }

}