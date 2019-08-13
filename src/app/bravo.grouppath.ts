import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo'

import { MenuStrip } from './controller/menustrip';
import { isNull } from 'util';
import { ToolStrip } from './lib/ui/toolstrip/toolstrip';
import { ComboBox, Menu } from 'wijmo/wijmo.input';

export class BravoGrouppath extends ComboBox {

    hostElement: HTMLElement;
    public comboBoxList = [];
    private _bIsAddItem = false;
    private _bLoadNewParentRow = true;
    private _flexGrid: wjGrid.FlexGrid;
    private _nTreeColumnPos: number;
    private _zGroupDes: string;
    private _zBinding = "";

    readonly onLoadedRow = new wjCore.Event();

    constructor(hostEl: HTMLElement, grid: wjGrid.FlexGrid, pnTreeColumnPos: number) {
        super(hostEl);
        this._flexGrid = grid;
        this._nTreeColumnPos = pnTreeColumnPos;

        if (this._nTreeColumnPos !== -1) {
            this._zBinding = this._flexGrid.columns[this._nTreeColumnPos].binding;
        }
    }

    public createNewGroupPath(pMenuStrip: MenuStrip, pParentNodeOfRow: any, pRow) {

        let _nLenParentNode = pParentNodeOfRow.length;

        let _nSpliceStart = 1;
        if (_nLenParentNode == 0 && this._nTreeColumnPos == -1) {
            _nSpliceStart = 0;
            this._bIsAddItem = false;
            this._bLoadNewParentRow = true;
            this.comboBoxList.splice(_nSpliceStart, this.comboBoxList.length);

            while (pMenuStrip.itemsSource.length > (2 * _nSpliceStart)) {
                pMenuStrip.itemsSource.pop();
            }
            return
        }
        // add new drop down when selection row
        if (this._bIsAddItem) {
            this.comboBoxList.splice(_nSpliceStart, this.comboBoxList.length);

            while (pMenuStrip.itemsSource.length > (2 * _nSpliceStart)) {
                pMenuStrip.itemsSource.pop();
            }

            for (let _i = 1; _i < _nLenParentNode; _i++) {
                this._createItemMenuStrip(pMenuStrip);
            }

            if (_nLenParentNode > 0 && pRow.grid
                .rows[pParentNodeOfRow[_nLenParentNode - 1].index + 1]
                .hasChildren) {
                this._createItemMenuStrip(pMenuStrip);
            }
            return;
        }
        // init dropdown item
        this._createItemMenuStrip(pMenuStrip);
        if (this._nTreeColumnPos == -1) {
            this._zGroupDes = pParentNodeOfRow[0].dataItem.groupDescription.propertyName;
        }
    }

    public setComboBoxItems(pRow, pMenuStrip: MenuStrip) {
        let _parentNodeOfRow = [];
        let _nIndex = -1;
        this._getParentNodeOfRow(pRow, _parentNodeOfRow);
        _parentNodeOfRow.reverse();

        if ((this._bLoadNewParentRow && _parentNodeOfRow.length > 0)
            || this._nTreeColumnPos !== -1) {
            this.createNewGroupPath(pMenuStrip, _parentNodeOfRow, pRow);
            this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
            this._bLoadNewParentRow = false;
            this._bIsAddItem = true;
            this._setVisibleDisplay(_parentNodeOfRow, pMenuStrip);
            return;
        }

        this.createNewGroupPath(pMenuStrip, _parentNodeOfRow, pRow);

        if (_parentNodeOfRow.length > 0 && this._nTreeColumnPos == -1
            && this._zGroupDes !== _parentNodeOfRow[0].dataItem.groupDescription.propertyName) {
            this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
        }

        for (let i = 0; i < _parentNodeOfRow.length; i++) {
            if (this.comboBoxList[0].itemsSource !== undefined) {
                _nIndex = _parentNodeOfRow[i].index + 1;
                let _thisRow = pRow.grid.rows[_nIndex];
                let _nCurrentLevel = _thisRow.hasChildren ? _thisRow.level : null;

                if (_nCurrentLevel === null) {
                    continue;
                }

                // Remove all items old in combobox 
                if (i + 1 < this.comboBoxList.length) {
                    if (this.comboBoxList[i + 1].itemsSource !== undefined) {
                        this.comboBoxList[i + 1].itemsSource = [];
                    }
                    this.comboBoxList[i + 1].itemsSource = this._getNodeChild(pRow, _nIndex, _nCurrentLevel);
                }
            }
        }
        this._setVisibleDisplay(_parentNodeOfRow, pMenuStrip);
    }

    public setSelectedRow(flexGrid: wjGrid.FlexGrid) {
        let _nIndex = -1;
        for (let _i = 0; _i < flexGrid.rows.length; _i++) {
            if (!(flexGrid.rows[_i].hasChildren)) {
                _nIndex = _i;
                break;
            }
        }

        flexGrid.select(new wjGrid.CellRange(_nIndex, 0));
    }

    private _createItemMenuStrip(pMenuStrip: MenuStrip, pParentNodeOfRow?) {
        let _comboBoxItem = new ComboBox(document.createElement('div'));
        _comboBoxItem.displayMemberPath = "name";
        _comboBoxItem.selectedValuePath = "index";
        _comboBoxItem.inputElement.setAttribute("hidden", "true");

        this.comboBoxList.push(_comboBoxItem);

        pMenuStrip.itemsSource.push(_comboBoxItem);
        pMenuStrip.itemsSource.push(new ToolStrip("", null, ""));
    }


    private _setVisibleDisplay(pParentNodeOfRow, pMenuStrip: MenuStrip) {
        pParentNodeOfRow.forEach((_item, _idx) => {
            if (this._nTreeColumnPos == -1) {
                this.comboBoxList[_idx].text = pParentNodeOfRow[_idx].dataItem.name.toString();
                pMenuStrip.itemsSource[(2 * _idx) + 1].text = pParentNodeOfRow[_idx].dataItem.name.toString();
            }
            else {
                this.comboBoxList[_idx].text = pParentNodeOfRow[_idx].dataItem[this._zBinding];
                pMenuStrip.itemsSource[(2 * _idx) + 1].text = pParentNodeOfRow[_idx].dataItem[this._zBinding];
            }
        })

        for (let _i = 0; _i < pMenuStrip.itemsSource.length; _i++) {
            pMenuStrip.itemsSource[_i].hostElement.setAttribute("hidden", "true");
            if (_i <= 2 * pParentNodeOfRow.length) {
                pMenuStrip.itemsSource[_i].hostElement.removeAttribute("hidden");
            }
        }
    }

    private _getNodeChild(pRow, pnIndexRow: number, pLevel: number) {
        // travel find node is group row from parent node position
        let _item = [];

        for (let i = pnIndexRow; i < pRow.grid.rows.length; i++) {
            let _thisRow = pRow.grid.rows[i];

            let _thisLevel = _thisRow.hasChildren ? _thisRow.level : null;

            if (_thisLevel !== null && _thisLevel < pLevel) {
                break;
            }

            // Add row group of level to combobox
            if (_thisLevel === pLevel) {
                if (this._nTreeColumnPos !== -1) {
                    _item.push(new Object({
                        index: _thisRow.index,
                        name: _thisRow.dataItem[
                            this._flexGrid.columns[this._nTreeColumnPos].binding]
                    }));
                    continue;
                }

                i += _thisRow.dataItem.items.length;
                _item.push(new Object({
                    index: _thisRow.index,
                    name: _thisRow.dataItem.name
                }));
            }
        }
        return _item;
    }

    private _getAllNodeLevelZero() {
        let _parentNode = [];

        // flex grid tree
        if (this._zBinding !== "") {
            this._flexGrid.rows.forEach((_item) => {
                if (_item.hasChildren && _item.level === 0) {
                    _parentNode.push(new Object({ index: _item.index, name: _item.dataItem[this._zBinding]}));
                }
            })
            return _parentNode;
        }

        // flex grid groupdescription
        this._flexGrid.rows.forEach((_item) => {
            if (_item.hasChildren && _item.level === 0) {
                _parentNode.push(new Object({ index: _item.index, name: _item.dataItem.name }));
            }
        })
        return _parentNode;
    }

    private _getParentNodeOfRow(pRow, pParentNodeOfItem: any) {
        if (pRow == null) {
            return;
        }

        if (pRow.hasChildren) {
            pParentNodeOfItem.push(pRow);
            let parentNode = this.getParentNode(pRow);
            this._getParentNodeOfRow(parentNode, pParentNodeOfItem);
        }
        else {

            let parentNode = this.getParentNode(pRow);
            this._getParentNodeOfRow(parentNode, pParentNodeOfItem);
        }
    }

    public getParentNode(pRow) {
        // get row level
        let startLevel = typeof (pRow.hasChildren) !== undefined && pRow.hasChildren ? pRow.level : null;
        let startIndex = pRow.index;

        // travel up to find parent node
        for (let i = startIndex - 1; i >= 0; i--) {
            let thisRow = pRow.grid.rows[i],
                thisLevel = thisRow.hasChildren ? thisRow.level : null;

            if (thisLevel != null) {
                if (startLevel == null || (startLevel > -1 && thisLevel < startLevel))
                    return thisRow;
            }
        }

        // not found
        return null;
    };


}
