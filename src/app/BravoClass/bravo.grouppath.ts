import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo';
import ResizeSensor from '../../assets/js/ResizeSensor';

import { MenuStrip } from '../controller/menustrip';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';
import { ComboBox } from 'wijmo/wijmo.input';
import { BravoWebGrid } from '../lib/ui/controls/bravo.web.grid';
import { AlignmentEnum } from '../lib/core/core';

export class BravoGrouppath extends ComboBox {

    hostElement: HTMLElement;
    public comboBoxList = [];
    private _bIsAddItem = false;
    private _bLoadNewParentRow = true;
    private _flexGrid: BravoWebGrid;
    private _toolTip = new wjCore.Tooltip();

    private _zGroupDes: string;
    private _bNewParent = true;
    private _bChangeFromCb = false;
    private _menuStrip: MenuStrip;
    private _nGroupItemCount: number = 0;
    private _bUpdateComplete: boolean = false;
    private _handlerSelectionChanged: any;
    private _subMenuStrip: MenuStrip;
    private _bCreateSubMenu: boolean = true;
    private _parentNodeOfRows = [];

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
            this._handlerSelectionChanged = this._flexGrid.debounceTime(this.grid_selectionChanged, 150);
            this._flexGrid.selectionChanged.removeHandler(this._handlerSelectionChanged.bind(this));
            this._flexGrid.onBeforeUpdateGroups.removeHandler(this.grid_beforeUpdate.bind(this));
            this._flexGrid.onAfterUpdateGroups.removeHandler(this.grid_updateComplete.bind(this));
        }

        try {
            this._flexGrid = pGrid;
        }
        finally {
            this._handlerSelectionChanged = this._flexGrid.debounceTime(this.grid_selectionChanged, 150);
            this._flexGrid.selectionChanged.addHandler(this._handlerSelectionChanged.bind(this));
            this._flexGrid.onBeforeUpdateGroups.addHandler(this.grid_beforeUpdate.bind(this));
            this._flexGrid.onAfterUpdateGroups.addHandler(this.grid_updateComplete.bind(this));

            this._menuStrip.itemsSource.push(new ToolStrip("btnOpenSubMenu", null, `<span class="fa fa-angle-double-right" aria-hidden="true"></span>`));
            this._menuStrip.setAlignment(this._menuStrip.getControl("btnOpenSubMenu"), AlignmentEnum.Right);
            this._menuStrip.getControl("btnOpenSubMenu").hostElement.style.display = 'none';
            this._menuStrip.getControl("btnOpenSubMenu").hostElement.addEventListener('mouseup', this._handleMouseUpBtnSubMenu.bind(this), false);

            document.body.addEventListener('mouseup', this._handleMouseUp.bind(this), false);
            // Listener event resize element of MenuStrip
            new ResizeSensor(this._menuStrip.hostElement, () => this.menu_onResize())
        }
    }

    private grid_selectionChanged(s, e) {
        this._nGroupItemCount = s.groups.count;
        let _row = this._flexGrid.selectedRows[0];
        this._setComboBoxItems(_row);
    }

    private grid_beforeUpdate(s, e) {
        this._flexGrid.selectionChanged.removeHandler(this._handlerSelectionChanged.bind(this));
    }

    private grid_updateComplete(s, e) {
        this._flexGrid.selectionChanged.addHandler(this._handlerSelectionChanged.bind(this));
        if (this._nGroupItemCount == 0) {
            this._setSelectedRowPos();
            return;
        }
        this._bUpdateComplete = true;
        if (s.selectedRows[0] == undefined || s.groups.count == 0) {
            this._setSelectedRowPos();
        }
        else {
            this._setComboBoxItems(s.selectedRows[0]);
        }
    }

    private _handleMouseUpBtnSubMenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        let _display = this._subMenuStrip.hostElement.style.display;

        if (String.compare(_display, 'none') == 0) {
            this._setCssforElement(this._subMenuStrip.hostElement);
            this._subMenuStrip.hostElement.style.display = 'inline-block';
            return;
        }
        this._subMenuStrip.hostElement.style.display = 'none';
    }

    private menu_onResize() {
        if (this._parentNodeOfRows.length > 0) {
            this._setDisplayItems(this._parentNodeOfRows);
        }
    }

    private _handleMouseUp() {
        if (!this._bChangeFromCb && this._subMenuStrip) {
            let _display = this._subMenuStrip.hostElement.style.display;
            if (_display !== '' && _display !== 'none') {
                this._subMenuStrip.hostElement.style.display = 'none';
            }
        }
    }

    private _createNewGroupPath(pParentNodeOfRow: any) {
        let _nLenParentNode = pParentNodeOfRow.length;
        let _nCbItemIdx = this._getCbFirst();

        // check row parent
        if (this._bIsAddItem) {
            let _nItemIndex = "";
            let _nMenuStripLeng = this._menuStrip.itemsSource.length;

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
                this._createItemMenuStrip();
            }

            let _nodeLast = pParentNodeOfRow[_nLenParentNode - 1];

            if (_nLenParentNode > 0) {
                if (this._flexGrid.rows[_nodeLast.index + 1].hasChildren) {
                    this._createItemMenuStrip(true);
                }
                else {
                    if (this.bTreeReport) {
                        for (let _i = _nodeLast.index + 1; _i < this._flexGrid.rows.length; _i++) {
                            if (this._flexGrid.rows[_i].level == _nodeLast.level
                                && this._flexGrid.rows[_i].hasChildren) {
                                break;
                            }

                            if (this._flexGrid.rows[_i].level > _nodeLast.level
                                && this._flexGrid.rows[_i].hasChildren) {
                                this._createItemMenuStrip(true);
                                break;
                            }
                        }
                    }
                }
            }

            this._bNewParent = true;
            return;
        }

        // init dropdown item
        this._createItemMenuStrip();
        if (!this.bTreeReport) {
            this._zGroupDes = pParentNodeOfRow[0].dataItem.groupDescription.propertyName;
        }
    }

    private _setComboBoxItems(pRow) {
        this._bChangeFromCb = false;
        if (this._parentNodeOfRows.length > 0) {
            this._parentNodeOfRows.clear();
        }
        let _nIndex = -1;
        this._getParentNodeOfRow(pRow, this._parentNodeOfRows);
        this._parentNodeOfRows.reverse();

        if (this.bTreeReport && this._getAllNodeLevelZero().itemCount == 0) {
            if (this.comboBoxList.length > 0) {
                this.comboBoxList.splice(0, this.comboBoxList.length);
                let _nCbItemIdx = this._getCbFirst();
                while (this._menuStrip.itemsSource.length > (_nCbItemIdx)) {
                    this._menuStrip.itemsSource[this._menuStrip.itemsSource.length - 1].hostElement.remove();
                    this._menuStrip.itemsSource.pop();
                }
            }

            this._bIsAddItem = false;
            return;
        }

        // first load
        if ((this._bLoadNewParentRow && this._parentNodeOfRows.length > 0)
            || (this._bLoadNewParentRow && this.bTreeReport)
            || (this.bTreeReport && this.comboBoxList.length == 0)) {
            this._createNewGroupPath(this._parentNodeOfRows);
            this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
            this._bLoadNewParentRow = false;
            this._bIsAddItem = true;
            this._setDisplayItems(this._parentNodeOfRows);
            return;
        }

        if (this._bLoadNewParentRow && this._parentNodeOfRows.length == 0 && !this.bTreeReport) {
            return;
        }

        // reload after
        this._createNewGroupPath(this._parentNodeOfRows);

        // add items to combobox
        if (this._bNewParent) {
            if (this._parentNodeOfRows.length > 0 && !this.bTreeReport
                && String.compare(this._zGroupDes, this._parentNodeOfRows[0].dataItem.groupDescription.propertyName) != 0) {
                this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
                this._bUpdateComplete = false;
            }

            // load new item for combox first, reset index.
            if (!this.bTreeReport && this._parentNodeOfRows.length > 0
                && this._nGroupItemCount > 0 && this._bUpdateComplete) {
                this.comboBoxList[0].itemsSource = this._getAllNodeLevelZero();
                this._bUpdateComplete = false;
            }

            for (let i = 0; i < this._parentNodeOfRows.length; i++) {
                if (this.comboBoxList[0].itemsSource !== undefined) {
                    _nIndex = this._parentNodeOfRows[i].index + 1;

                    let _thisRow = pRow.grid.rows[_nIndex];

                    let _nCurrentLevel = _thisRow.hasChildren || this.bTreeReport ? _thisRow.level : null

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
            this._setDisplayItems(this._parentNodeOfRows);
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

    private _setSelectedRowPos(pnRowIdx?: number) {
        if (pnRowIdx !== undefined) {
            this._flexGrid.selection = new wjGrid.CellRange(pnRowIdx, this._flexGrid.nTreeColumnPos)

            let _rowParent = this.getParentNode(this._flexGrid.rows[pnRowIdx]);
            if (_rowParent !== null && _rowParent.isCollapsed) _rowParent.isCollapsed = false;
            this._bChangeFromCb = false;
            return;
        }

        for (let _i = 0; _i < this._flexGrid.rows.length; _i++) {
            if (!this._flexGrid.rows[_i].hasChildren || this._flexGrid.rows[_i].hasChildren == undefined) {
                this._flexGrid.selection = new wjGrid.CellRange(_i, this._flexGrid.nTreeColumnPos);
                break;
            }
        }
    }

    private _createItemMenuStrip(pbParentNodeLast?: boolean) {
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
                this._setSelectedRowPos(_id);
            }

            this._bChangeFromCb = false
        })

        this.comboBoxList.push(_cbItem);
        this._menuStrip.itemsSource.push(_cbItem);
        if (!pbParentNodeLast) {
            this._menuStrip.itemsSource.push(new ToolStrip("", null, ""));
        }
    }

    private _setDisplayItems(pParentNodeOfRow) {
        this._toolTip.dispose();
        this._toolTip.cssClass = "bravo-tooltip"; // change css tooltip
        this._toolTip.showDelay = 250;

        if (this.bTreeReport && pParentNodeOfRow.length == 0) {
            let _nCbItemIdx = this._getCbFirst();

            this._menuStrip.itemsSource[_nCbItemIdx + 1].text = "";
            this._menuStrip.itemsSource[_nCbItemIdx + 1].name = "";
            this._menuStrip.itemsSource[_nCbItemIdx].selectedIndex = -1;
            return;
        }

        let _nIndexParent = 0;

        this._menuStrip.itemsSource.beginUpdate();
        try {
            this._menuStrip.itemsSource.forEach((_item, _idx) => {
                if (_item instanceof ComboBox && _nIndexParent < pParentNodeOfRow.length) {
                    if (!this.bTreeReport) {
                        this._menuStrip.itemsSource[_idx + 1].text = BravoWebGrid.getGroupHeader(pParentNodeOfRow[_nIndexParent]);
                    }
                    else {
                        this._menuStrip.itemsSource[_idx + 1].text = pParentNodeOfRow[_nIndexParent].dataItem[this._flexGrid.zTreeColName];
                    }

                    let _itemElement = this._menuStrip.itemsSource[_idx + 1].hostElement;
                    this._toolTip.setTooltip(_itemElement, this._menuStrip.itemsSource[_idx + 1].text);

                    this._menuStrip.itemsSource[_idx + 1].name = pParentNodeOfRow[_nIndexParent].index.toString();
                    this._changeSelectionIndex(_idx, pParentNodeOfRow[_nIndexParent].index);
                    _nIndexParent++;
                }
            })
        }
        finally {
            this._menuStrip.itemsSource.endUpdate();
            this._createSubMenuStrip();
            this._addItemToSubMenuStrip(this._menuStrip.itemsSource.length - 1);
        }
    }

    private _addItemToSubMenuStrip(pnMenuStripItemsLen: number) {
        let _subMenuStripTranfer = new MenuStrip(document.createElement('div'));
        let _bAddItemComplete = false;
        if (this._menuStripMaxWidth() && this._subMenuStrip) {
            this._subMenuStrip.itemsSource.clear();
            this._subMenuStrip.setAlignment(this._menuStrip.itemsSource[0], AlignmentEnum.Right);
            this._subMenuStrip.setAlignment(this._menuStrip.itemsSource[1], AlignmentEnum.Right);
            this._sliceItemsMenuStrip(pnMenuStripItemsLen, _subMenuStripTranfer);
            _bAddItemComplete = true;
        }

        if (_bAddItemComplete) {
            let _nLengthItem = _subMenuStripTranfer.itemsSource.length;
            while (_nLengthItem > 0) {
                this._subMenuStrip.itemsSource.push(_subMenuStripTranfer.itemsSource[_nLengthItem - 1]);
                _nLengthItem--;
            }
            return;
        }

        this._menuStrip.setAlignment(this._menuStrip.itemsSource[0], AlignmentEnum.Right);
        this._menuStrip.setAlignment(this._menuStrip.itemsSource[1], AlignmentEnum.Right);
        this._menuStrip.getControl('btnOpenSubMenu').hostElement.style.display = 'none';
    }

    private _createSubMenuStrip() {
        if (!this._menuStripMaxWidth() && this._subMenuStrip) {
            this._subMenuStrip.hostElement.remove();
            this._bCreateSubMenu = true;
        }

        if (this._menuStripMaxWidth() && this._bCreateSubMenu) {
            this._menuStrip.getControl('btnOpenSubMenu').hostElement.style.display = 'inline-block';

            let _nodeChild = document.createElement('div');
            document.body.appendChild(_nodeChild);
            this._setCssforElement(_nodeChild)

            this._subMenuStrip = new MenuStrip(_nodeChild);
            this._subMenuStrip.bMouseHoverDisable = true;
            this._subMenuStrip.selectedIndexChanged.addHandler(this._onMouseUpSubMenu.bind(this));
            this._subMenuStrip.hostElement.firstElementChild.setAttribute('style', 'display:inline');
            this._subMenuStrip.hostElement.lastElementChild.setAttribute('style', 'display:inline');
            this._bCreateSubMenu = false;
        }
    }

    private _sliceItemsMenuStrip(pnCbCountItem: number, pbSubMenu: MenuStrip) {
        if (this._menuStripMaxWidth()) {
            pbSubMenu.itemsSource.push(this._menuStrip.itemsSource[pnCbCountItem]);
            pnCbCountItem--;
            this._sliceItemsMenuStrip(pnCbCountItem, pbSubMenu);
        }
    }

    private _setCssforElement(pnHost: HTMLElement) {
        let _clientRect = this._menuStrip.hostElement.getBoundingClientRect();
        let _clientBodyRect = document.body.getBoundingClientRect();
        wjCore.setCss(pnHost, {
            position: 'absolute',
            display: 'none',
            height: 'auto',
            maxWidth: '250px',
            top: _clientRect.bottom + Math.abs(_clientBodyRect.top),
            right: _clientBodyRect.width - Math.floor(_clientRect.right),
            border: '#A0A0A0 thin solid'
        });
    }

    private _onMouseUpSubMenu() {
        if (this._subMenuStrip.selectedItem instanceof ToolStrip) {
            this._subMenuStrip.hostElement.style.display = 'none';
            return;
        }
    }

    private _menuStripMaxWidth() {
        let _nParentWidth = Math.floor(this._menuStrip.hostElement.getBoundingClientRect().width);
        let _nChildrenWidth = Math.floor(this._menuStrip.hostElement.children[0].getBoundingClientRect().width)
            + Math.floor(this._menuStrip.hostElement.children[1].getBoundingClientRect().width);

        if (_nChildrenWidth > _nParentWidth) return true;
        return false;
    }

    private _changeSelectionIndex(pnIndex: number, pnItemIdx: number) {
        let _nIdx = -1;
        let _items = this._menuStrip.itemsSource[pnIndex].itemsSource.items;
        for (let _i = 0; _i < _items.length; _i++) {
            if (_items[_i].index == pnItemIdx) {
                _nIdx = _i;
                break;
            }
        }

        this._menuStrip.itemsSource[pnIndex].selectedIndex = _nIdx;
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
                    name: BravoWebGrid.getGroupHeader(_thisRow)
                }));
            }
        }
        return new wjCore.CollectionView(_item, { currentItem: null });
    }

    private _getAllNodeLevelZero() {
        let _parentNode = [];

        // flex grid tree
        if (this.bTreeReport) {
            this._flexGrid.rows.forEach((_item) => {
                if (_item.hasChildren && _item.level === 0) {
                    _parentNode.push(new Object({
                        index: _item.index,
                        name: _item.dataItem[this._flexGrid.zTreeColName]
                    }));
                }
            })
            return new wjCore.CollectionView(_parentNode, { currentItem: null });
        }

        // flex grid groupdescription
        for (let _i = 0; _i < this._flexGrid.rows.length; _i++) {
            let _item = this._flexGrid.rows[_i];
            if (_item instanceof wjGrid.GroupRow && _item.level === 0) {
                _parentNode.push(new Object({
                    index: _item.index,
                    name: BravoWebGrid.getGroupHeader(_item)
                }));

                _i += _item.dataItem.items.length;
            }
        }
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
