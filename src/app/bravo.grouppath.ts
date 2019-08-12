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

    readonly onLoadedRow = new wjCore.Event();

    constructor(hostEl: HTMLElement, grid: wjGrid.FlexGrid, pnTreeColumnPos: number) {
        super(hostEl);
        this._flexGrid = grid;
        this._nTreeColumnPos = pnTreeColumnPos;
    }

    public createNewGroupPath(pMenuStrip: MenuStrip, pParentNodeOfRow: any, pRow) {
        // add new drop down when selection row
        if (this._bIsAddItem) {
            this.comboBoxList.splice(1, this.comboBoxList.length);
            while(pMenuStrip.itemsSource.length > 2) {
                pMenuStrip.itemsSource.pop();
            }

            for (let _i = 1; _i < pParentNodeOfRow.length; _i++) {
                this._createItemMenuStrip(pMenuStrip);
            }
            // if (pParentNodeOfRow[pParentNodeOfRow.length] !== undefined) {
                this._createItemMenuStrip(pMenuStrip);
            // }
            return;
        }

        // init dropdown item
            this._createItemMenuStrip(pMenuStrip);
            this._bIsAddItem = true;
    }


    public setComboBoxItems(pRow, pMenuStrip: MenuStrip) {
        let _parentNodeOfRow = [];
        let _nIndex = -1;
        this._getParentNodeOfRow(pRow, _parentNodeOfRow);
        _parentNodeOfRow.reverse();

        if (this._bLoadNewParentRow) {
            console.log("0000")
            this.createNewGroupPath(pMenuStrip, _parentNodeOfRow, pRow);
            this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
            this._bLoadNewParentRow = false;
            return;
        }

        this.createNewGroupPath(pMenuStrip, _parentNodeOfRow, pRow);
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

    private _createItemMenuStrip(pMenuStrip: MenuStrip) {
        let _comboBoxItem = new ComboBox(document.createElement('div'));
            _comboBoxItem.displayMemberPath = "name";
            _comboBoxItem.selectedValuePath = "index";

            this.comboBoxList.push(_comboBoxItem);

            pMenuStrip.itemsSource.push(_comboBoxItem);
            pMenuStrip.itemsSource.push(new ToolStrip("", null, ""));
    }   


    private _setVisibleDisplay(pParentNodeOfItem, pMenuStrip: MenuStrip) {
        pParentNodeOfItem.forEach((_item, _idx) => {
            this.comboBoxList[_idx].text = pParentNodeOfItem[_idx].dataItem.name.toString();
        })

        for (let _i = 0; _i < pMenuStrip.itemsSource.length; _i++) {
            pMenuStrip.itemsSource[_i].hostElement.setAttribute("hidden", "true");
            if (_i <= 2 * pParentNodeOfItem.length) {
                pMenuStrip.itemsSource[_i].hostElement.removeAttribute("hidden");
            }
        }
    }

    private _reIndexElement(pnIndex: number, pMenuStrip: MenuStrip) {
        for (let _n = pnIndex; _n < pMenuStrip.itemsSource.length; _n++) {
            let _element = pMenuStrip.itemsSource[_n].hostElement;
            if (_element) _element.setAttribute('bravo-menustrip-index', _n.toString());
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
                    _item.push(new Object({ index: _thisRow.index,
                        name: _thisRow.dataItem[
                            this._flexGrid.columns[this._nTreeColumnPos].binding]}));
                    continue;
                }

                i += _thisRow.dataItem.items.length;
                _item.push(new Object({ index: _thisRow.index,
                    name: _thisRow.dataItem.name}));
            }
        }
        return _item;
    }

    private _getAllNodeLevelZero() {
        let _zBinding = "";
        if (this._nTreeColumnPos !== -1) {
            _zBinding = this._flexGrid.columns[this._nTreeColumnPos].binding;
        }

        let _parentNode = [];

        // flex grid tree
        if (_zBinding !== "") {
            this._flexGrid.rows.forEach((_item) => {
                if (_item.hasChildren && _item.level === 0) {
                    _parentNode.push(new Object({ index: _item.index, name: _item.dataItem[_zBinding] }));
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
