import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo'

import { MenuStrip } from './controller/menustrip';
import { isNull } from 'util';
import { ToolStrip } from './lib/ui/toolstrip/toolstrip';
import { ComboBox, Menu } from 'wijmo/wijmo.input';

export class BravoGrouppath extends ComboBox {

    hostElement: HTMLElement;
    public comboBoxList = [];
    private _bIsAddItem = true;
    private _bLoadNewParentRow = false;
    private _flexGrid: wjGrid.FlexGrid;

    readonly onLoadedRow = new wjCore.Event();

    constructor(hostEl: HTMLElement, grid: wjGrid.FlexGrid) {
        super(hostEl);
        this._flexGrid = grid;
    }




    public createNewGroupPath(pMenuStrip: MenuStrip) {
           
        //add new item to menustrip
        // if (this.comboBoxList.length > 0 && this._bIsAddItem) {
            let _comboBoxItem = new ComboBox(document.createElement('div'));
            _comboBoxItem.displayMemberPath = "name";
            _comboBoxItem.selectedValuePath = "index";
            // _comboBoxItem.selectedIndexChanged.addHandler(() => {
            //     let _value = _comboBoxItem.selectedValue;
            //     flexGrid.select(new wjGrid.CellRange(_value, 0));
            // }) 

            this.comboBoxList.push(_comboBoxItem);

            pMenuStrip.itemsSource.push(_comboBoxItem);
            pMenuStrip.itemsSource.push(new ToolStrip("", null, ""));
        // }

        // load default items to menustrip
        // if (this.comboBoxList.length == 0) {
        //     pCv.groupDescriptions.forEach((groupDes) => {
        //         let _comboBoxItem = new ComboBox(document.createElement('div'));
        //         _comboBoxItem.displayMemberPath = "name";
        //         _comboBoxItem.selectedValuePath = "index";

        //         this.comboBoxList.push(_comboBoxItem);

        //         pMenuStrip.itemsSource.push(_comboBoxItem);
        //         pMenuStrip.itemsSource.push(new ToolStrip(groupDes.propertyName.toString(), null, ""));
        //     })
        // }

        if (this._flexGrid.rows[0] instanceof (wjGrid.GroupRow)) {
            let i = -1;
            this._flexGrid.rows.forEach((row, _idx) => {
                if (row.hasChildren == undefined) {
                    i = _idx;
                    console.log(i)
                    return
                }
            })
            this._flexGrid.select(i , 0);
        }
        
         this._bIsAddItem = true;
    }

    public removeControl(pMenuStrip: MenuStrip, name: string) {
        this._bIsAddItem = false;
        let _index = pMenuStrip.itemsSource.findIndex( ctrl => {
            if (ctrl instanceof ToolStrip) {
                return ctrl.name === name
            }
        })

        if (_index !== -1) {
            pMenuStrip.itemsSource.removeAt(_index);
            pMenuStrip.itemsSource.removeAt(_index - 1);
        }

        this.comboBoxList.splice(Math.floor(_index/2), 1);
        this._reIndexElement(_index - 1, pMenuStrip)

        if (Math.floor(_index/2) === 0) this._bLoadNewParentRow = true;
    }


    public setComboBoxItems(pRow, pMenuStrip: MenuStrip) {
        let _parentNodeOfRow = [];
        let _nIndex = -1;
        this._getParentNodeOfRow(pRow, _parentNodeOfRow);

        _parentNodeOfRow.reverse();

        for (let i = 0; i < _parentNodeOfRow.length; i++) {
            if (this.comboBoxList[0].itemsSource === undefined || this._bLoadNewParentRow) {
                this.comboBoxList[0].itemsSource = this._getNodeChild(pRow, 0, 0);

                if (this.comboBoxList.length > 1) {
                    this.comboBoxList[1].itemsSource = this._getNodeChild(pRow, 1, 1);
                }
                this._bLoadNewParentRow = false;
                return;
            }

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
                i += _thisRow.dataItem.items.length;
                _item.push(new Object({ index: _thisRow.index, name: _thisRow.dataItem.name }))
            }
        }
        return _item;
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
        let startLevel = typeof(pRow.hasChildren) !== undefined && pRow.hasChildren ? pRow.level : null;
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
