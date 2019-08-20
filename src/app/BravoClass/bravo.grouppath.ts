import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo'

import { MenuStrip } from '../controller/menustrip';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';
import { ComboBox, Menu } from 'wijmo/wijmo.input';
import { BravoWebGrid } from '../lib/ui/controls/bravo.web.grid';
import { filter } from 'rxjs/operators';

export class BravoGrouppath extends ComboBox {

    hostElement: HTMLElement;
    public comboBoxList = [];
    private _bIsAddItem = false;
    private _bLoadNewParentRow = true;
    private _flexGrid: BravoWebGrid;

    private _zGroupDes: string;
    private _bNewParent = true;
    private _bChangeFromCb = false;
    private _menuStrip: MenuStrip;

    public get bTreeReport(): boolean {
        return this._flexGrid ? this._flexGrid.isTreeNodeMode() : false;
    }

    private _visible: boolean = true;

    public get visible(): boolean {
        return this._visible || (this.hostElement && !this.hostElement.classList.contains('wj-state-hidden'));
    }

    public set visible(value: boolean) {
        if (this._visible == value) return;
        this._visible = value;
    }

    constructor(pMenuStrip: MenuStrip, pGrid?: BravoWebGrid) {
        super(document.createElement('div'));
        this._menuStrip = pMenuStrip;

        this.setupItem(pGrid);
    }

    public setupItem(pGrid: BravoWebGrid) {
        if (pGrid == null || this._flexGrid == pGrid)
            return;

        if (this._flexGrid) {
            this._flexGrid.selectionChanged.removeHandler(this.grid_selectionChanged.bind(this));
            this._flexGrid.loadedRows.removeHandler(this.grid_loadedRows.bind(this));
        }

        try {
            this._flexGrid = pGrid;
        }
        finally {
            this._flexGrid.selectionChanged.addHandler(this.grid_selectionChanged.bind(this));
            this._flexGrid.loadedRows.addHandler(this.grid_loadedRows.bind(this));
        }
    }

    private grid_selectionChanged(s, e) {
        let _row = this._flexGrid.selectedRows[0];
        this.setComboBoxItems(_row);
    }

    private grid_loadedRows(s, e) {
        this._setSelectedRow();
        this._bNewParent = true;
    }

    public createNewGroupPath(pParentNodeOfRow: any, pRow) {
        let _nLenParentNode = pParentNodeOfRow.length;

        // check row parent
        if (this._bIsAddItem) {
            let _nItemIndex = "";
            let _nMenuStripLeng = this._menuStrip.itemsSource.length;
            let _nCbItemIdx = this._getCbFirst();

            if (_nCbItemIdx !== null) {
                if (this._menuStrip.itemsSource[_nMenuStripLeng - 2] instanceof ComboBox
                    && this._menuStrip.itemsSource[_nMenuStripLeng - 1].name == ""
                    && (_nMenuStripLeng - 3) > _nCbItemIdx) {
                    _nItemIndex = this._menuStrip.itemsSource[_nMenuStripLeng - 3].name
                }
                else {
                    _nItemIndex = this._menuStrip.itemsSource[_nMenuStripLeng - 1].name;
                }
            }

            // if row not change parent node then return.
            if ((pParentNodeOfRow[_nLenParentNode - 1] == undefined && _nItemIndex == "")
                || (pParentNodeOfRow[_nLenParentNode - 1] !== undefined
                    && pParentNodeOfRow[_nLenParentNode - 1].index.toString() === _nItemIndex)) {

                this._bNewParent = false;
                return;
            }
        }

        let _nSpliceStart = 1;
        let _nCbItemIdx = this._getCbFirst();

        // remove all menustrip item if remove item first
        if (_nLenParentNode == 0 && !this.bTreeReport) {
            if (this.comboBoxList.length == 0) {
                this._bNewParent = true;
                return;
            }

            _nSpliceStart = 0;
            this._bIsAddItem = false;
            this._bLoadNewParentRow = true;
            this.comboBoxList.splice(_nSpliceStart, this.comboBoxList.length);

            while (this._menuStrip.itemsSource.length > (_nCbItemIdx)) {
                this._menuStrip.itemsSource[this._menuStrip.itemsSource.length - 1].hostElement.remove();
                this._menuStrip.itemsSource.pop();
            }
            this._bNewParent = true;
            return
        }

        // add new drop down when selection row
        if (this._bIsAddItem) {
            this.comboBoxList.splice(_nSpliceStart, this.comboBoxList.length);

            while (this._menuStrip.itemsSource.length > (_nCbItemIdx + 2)) {
                this._menuStrip.itemsSource[this._menuStrip.itemsSource.length - 1].hostElement.remove();
                this._menuStrip.itemsSource.pop();
            }

            for (let _i = 1; _i < _nLenParentNode; _i++) {
                this._createItemMenuStrip(this._menuStrip);
            }

            if (_nLenParentNode > 0 && pRow.grid
                .rows[pParentNodeOfRow[_nLenParentNode - 1].index + 1]
                .hasChildren) {
                this._createItemMenuStrip(this._menuStrip);
            }

            this._bNewParent = true;
            return;
        }

        // init dropdown item
        this._createItemMenuStrip(this._menuStrip);
        if (!this.bTreeReport) {
            this._zGroupDes = pParentNodeOfRow[0].dataItem.groupDescription.propertyName;
        }
    }

    public setComboBoxItems(pRow) {
        this._bChangeFromCb = false;
        let _parentNodeOfRow = [];
        let _nIndex = -1;
        this._getParentNodeOfRow(pRow, _parentNodeOfRow);
        _parentNodeOfRow.reverse();


        // first load
        if ((this._bLoadNewParentRow && _parentNodeOfRow.length > 0)
            || (this._bLoadNewParentRow && this.bTreeReport)) {
            this.createNewGroupPath(_parentNodeOfRow, pRow);
            this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
            this._bLoadNewParentRow = false;
            this._bIsAddItem = true;
            this._setVisibleDisplay(_parentNodeOfRow, this._menuStrip);
            return;
        }

        if (this._bLoadNewParentRow && _parentNodeOfRow.length == 0 && !this.bTreeReport) {
            return;
        }

        // reload after
        this.createNewGroupPath(_parentNodeOfRow, pRow);

        // add items to combobox
        if (this._bNewParent) {
            if (_parentNodeOfRow.length > 0 && !this.bTreeReport
                && String.compare(this._zGroupDes, _parentNodeOfRow[0].dataItem.groupDescription.propertyName) != 0) {
                this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
            }

            if (!this.bTreeReport && _parentNodeOfRow.length > 0) {
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

            // set display menustrip
            this._setVisibleDisplay(_parentNodeOfRow, this._menuStrip);
            this._bNewParent = false;
        }
    }

    private _getCbFirst() {
        for (let _i = 0; _i < this._menuStrip.itemsSource.length; _i++) {
            if (this._menuStrip.itemsSource[_i] instanceof ComboBox) {
                return _i;
            }
        }

        return null;
    }

    private _setSelectedRow(_pnRowIdx?: number) {
        if (_pnRowIdx !== undefined) {
            this._flexGrid.select(new wjGrid.CellRange(_pnRowIdx, this._flexGrid.nTreeColumnPos));

            let _rowParent = this.getParentNode(this._flexGrid.rows[_pnRowIdx]);
            if (_rowParent !== null && _rowParent.isCollapsed) _rowParent.isCollapsed = false;
            this._bChangeFromCb = false;
            return;
        }

        let _nIndex = 0;
        for (let _i = 0; _i < this._flexGrid.rows.length; _i++) {
            if (!(this._flexGrid.rows[_i].hasChildren)) {
                _nIndex = _i;
                break;
            }
        }
        this._flexGrid.select(new wjGrid.CellRange(_nIndex, this._flexGrid.nTreeColumnPos));
        this._bChangeFromCb = false;
    }

    private _createItemMenuStrip(pMenuStrip: MenuStrip) {
        let _cbItem = new ComboBox(document.createElement('div'));
        _cbItem.isRequired = false;
        _cbItem.displayMemberPath = "name";
        _cbItem.selectedValuePath = "index";
        _cbItem.dropDownCssClass = "bravo-drop-down";
        _cbItem.maxDropDownHeight = 350;

        let _cbHostElem = _cbItem.hostElement;
        _cbHostElem.classList.remove('wj-combobox', 'wj-dropdown');
        _cbHostElem.querySelector('input').remove();

        let _cbQuerySelector = _cbItem.hostElement.querySelector('button');
        _cbQuerySelector.classList.remove('wj-btn', 'wj-btn-default');
        _cbQuerySelector.querySelector('span').classList.remove('wj-glyph-down');
        _cbQuerySelector.querySelector('span').classList.add('fa', 'fa-angle-right');
        _cbQuerySelector.classList.add("bravo-btn");

        _cbItem.isDroppedDownChanged.addHandler(() => {
            if (_cbItem.isDroppedDown) {
                this._bChangeFromCb = true;
            }
            else {
                this._bChangeFromCb = false;
            }

            let _oldClass = _cbItem.isDroppedDown ? 'fa-angle-right' : 'fa-angle-down';
            let _newClass = _cbItem.isDroppedDown ? 'fa-angle-down' : 'fa-angle-right';

            _cbQuerySelector.querySelector('span').classList.replace(_oldClass, _newClass);
        })

        _cbItem.selectedIndexChanged.addHandler(() => {
            let _id = _cbItem.selectedValue;

            if (this._bChangeFromCb) {
                this._setSelectedRow(_id);
            }

            this._bChangeFromCb = false
        })

        this.comboBoxList.push(_cbItem);
        pMenuStrip.itemsSource.push(_cbItem);
        pMenuStrip.itemsSource.push(new ToolStrip("", null, ""));
    }

    private _setVisibleDisplay(pParentNodeOfRow, pMenuStrip: MenuStrip) {
        if (this.bTreeReport && pParentNodeOfRow.length == 0) {

            let _nCbItemIdx = this._getCbFirst();

            pMenuStrip.itemsSource[_nCbItemIdx + 1].text = "";
            pMenuStrip.itemsSource[_nCbItemIdx + 1].name = "";
            pMenuStrip.itemsSource[_nCbItemIdx].selectedIndex = -1;
            return;
        }

        let _nIndexParent = 0;
        pMenuStrip.itemsSource.forEach((_item, _idx) => {
            if (!this.bTreeReport) {
                if (_item instanceof ComboBox && _nIndexParent < pParentNodeOfRow.length) {
                    pMenuStrip.itemsSource[_idx + 1].text = pParentNodeOfRow[_nIndexParent].dataItem.name.toString();
                }
            }
            else {
                if (_item instanceof ComboBox && _nIndexParent < pParentNodeOfRow.length) {
                    pMenuStrip.itemsSource[_idx + 1].text = pParentNodeOfRow[_nIndexParent].dataItem[this._flexGrid.zTreeColName];
                }
            }

            if (_item instanceof ComboBox && _nIndexParent < pParentNodeOfRow.length) {
                pMenuStrip.itemsSource[_idx + 1].name = pParentNodeOfRow[_nIndexParent].index.toString();
                this._changeSelectionIndex(pMenuStrip, _idx, pParentNodeOfRow[_nIndexParent].index);
                _nIndexParent++;
            }
        })
    }

    private _changeSelectionIndex(pMenuStrip: MenuStrip, _pnIndex: number, _pnItemIdx: number) {
        let _nIdx = -1;
        let _items = pMenuStrip.itemsSource[_pnIndex].itemsSource.items;
        for (let _i = 0; _i < _items.length; _i++) {
            if (_items[_i].index == _pnItemIdx) {
                _nIdx = _i;
                break;
            }
        }

        pMenuStrip.itemsSource[_pnIndex].selectedIndex = _nIdx;
        this._bChangeFromCb = false;
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
                if (this.bTreeReport) {
                    _item.push(new Object({
                        index: _thisRow.index,
                        name: _thisRow.dataItem[this._flexGrid.zTreeColName]
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
        return new wjCore.CollectionView(_item, { currentItem: null });
    }

    private _getAllNodeLevelZero() {
        let _parentNode = [];

        // flex grid tree
        if (this._flexGrid.zTreeColName !== null) {
            this._flexGrid.rows.forEach((_item) => {
                if (_item.hasChildren && _item.level === 0) {
                    _parentNode.push(new Object({ index: _item.index, name: _item.dataItem[this._flexGrid.zTreeColName] }));
                }
            })
            return new wjCore.CollectionView(_parentNode, { currentItem: null });
        }

        // flex grid groupdescription
        this._flexGrid.rows.forEach((_item) => {
            if (_item.hasChildren && _item.level === 0) {
                _parentNode.push(new Object({ index: _item.index, name: _item.dataItem.name }));
            }
        })
        return new wjCore.CollectionView(_parentNode, { currentItem: null });
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
    }

    refresh(fullUpdate?: boolean) {
        super.refresh(fullUpdate);

        if (this.hostElement) {
            if (!this.visible && !this.hostElement.classList.contains('wj-state-hidden'))
                wjCore.addClass(this.hostElement, 'wj-state-hidden');
            else if (this.visible && this.hostElement.classList.contains('wj-state-hidden'))
                wjCore.removeClass(this.hostElement, 'wj-state-hidden');
        }
    }
}
