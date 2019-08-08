import * as wjGrid from 'wijmo/wijmo.grid';
import * as wjCore from 'wijmo/wijmo'

import { DropDown } from './controller/dropdown';
import { MenuStrip } from './controller/menustrip';
import { isNull } from 'util';
import { ToolStrip } from './lib/ui/toolstrip/toolstrip';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

export class BravoGrouppath extends DropDown {

    hostElement: HTMLElement;
    private _columnGroupList: string[];
    private _grid: wjGrid.FlexGrid;
    private _row: wjGrid.Row;
    private _cv: wjCore.CollectionView;
    private _groupColumnPos: number;
    public dropDownList = [];
    private _parentNodeOfItems = [];

    constructor(hostEl: HTMLElement, pGrid: wjGrid.FlexGrid) {
        super(hostEl);
        this._grid = pGrid;
    }


    public createNewGroupPath(pMenuStrip: MenuStrip, pCv: wjCore.CollectionView) {
        let _nLenDropDown = this.dropDownList.length;
        let _nLenCvGroupDes = pCv.groupDescriptions.length;

        if (_nLenDropDown > _nLenCvGroupDes) {
            for (let i = 0; i < _nLenDropDown; i++) {
                if (i >= _nLenCvGroupDes) {
                    this.dropDownList.splice(i,1);
                    pMenuStrip.itemsSource.removeAt(i)
                    pMenuStrip.itemsSource.removeAt(i)
                }
            }
            return
        }

        //add new itemsource to menustrip
        if (this.dropDownList.length > 0) {
            let _dropDownItem = new DropDown(document.createElement('div'));
            this.dropDownList.push(_dropDownItem);
            pMenuStrip.itemsSource.push(_dropDownItem);
            pMenuStrip.itemsSource.push(new ToolStrip('name', null, "12345"));
            return;
        }

        pCv.groupDescriptions.forEach((groupDes) => {
            let _dropDown = new DropDown(document.createElement('div'));
            _dropDown.text = groupDes.propertyName;
            _dropDown.displayMemberPath = "_name";
            this.dropDownList.push(_dropDown);
            pMenuStrip.itemsSource.push(_dropDown);
            pMenuStrip.itemsSource.push(new ToolStrip('name', null, "12345"));
        })

    }

    public _setDropDownItems(pRow) {
        let _parentNodeOfItems = [];
        let _nIndex = -1;
        this._getParentNodeOfItem(pRow, _parentNodeOfItems);

        _parentNodeOfItems.reverse();
        let _nLenParentNode = _parentNodeOfItems.length

        for (let i = 0; i < _nLenParentNode; i++) {
            if (this.dropDownList[0].itemsSource.length === 0) {
                this._getNodeChild(pRow, 0, 0, 0);

                if (this.dropDownList.length > 1) {
                    this._getNodeChild(pRow, 1, 1, 1);
                }
            }

            if (this.dropDownList[0].itemsSource.length !== 0) {
                _nIndex = _parentNodeOfItems[i].index + 1;
                let _thisRow = pRow.grid.rows[_nIndex];
                let _nCurrentLevel = _thisRow instanceof (wjGrid.GroupRow) ? _thisRow.level : null;

                if (_nCurrentLevel === null) {
                    continue;
                }

                // Remove all node old in dropdown item
                if (i + 1 < this.dropDownList.length) {
                    let _totalItems = this.dropDownList[i + 1].itemsSource.length;
                    if (_totalItems > 0) {
                        this.dropDownList[i + 1].itemsSource.splice(0, _totalItems);
                    }
                    this._getNodeChild(pRow, i + 1, _nIndex, _nCurrentLevel);
                }
            }
        }
    }

    private _getNodeChild(pRow, pnIdxDropDown: number, pnIndexRow: number, pLevel: number) {
        // travel find node is group row from parent node position
        for (let i = pnIndexRow; i < pRow.grid.rows.length; i++) {
            let _thisRow = pRow.grid.rows[i];

            let _thisLevel = _thisRow instanceof (wjGrid.GroupRow) ? _thisRow.level : null;

            if (_thisLevel !== null && _thisLevel < pLevel) {
                break;
            }

            // Add row group of level to dropdown
            if (_thisLevel === pLevel) {
                i += _thisRow.dataItem.items.length;
                this.dropDownList[pnIdxDropDown].itemsSource.push(new ToolStrip(
                    _thisRow.index.toString(),
                    document.createElement('div'),
                    _thisRow.dataItem.name.toString()
                ));

            }
        }
    }

    private _getParentNodeOfItem(pRow, pParentNodeOfItem: any) {
        if (pRow instanceof (wjGrid.GroupRow)) {
            pParentNodeOfItem.push(pRow);
            let parentNode = this.getParentNode(pRow);
            this._getParentNodeOfItem(parentNode, pParentNodeOfItem);
        }
        else {
            if (isNull(pRow)) {
                return;
            }

            let parentNode = this.getParentNode(pRow);
            this._getParentNodeOfItem(parentNode, pParentNodeOfItem);
        }
    }

    public getParentNode(pRow) {
        // get row level
        let startLevel = pRow instanceof (wjGrid.GroupRow) ? pRow.level : null;
        let startIndex = pRow.index;

        // travel up to find parent node
        for (let i = startIndex - 1; i >= 0; i--) {
            let thisRow = pRow.grid.rows[i],
                thisLevel = thisRow instanceof (wjGrid.GroupRow) ? thisRow.level : null;

            if (thisLevel != null) {
                if (startLevel == null || (startLevel > -1 && thisLevel < startLevel))
                    return thisRow;
            }
        }

        // not found
        return null;
    };


}
