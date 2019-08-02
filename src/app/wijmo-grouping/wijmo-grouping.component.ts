import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import * as wjInput from 'wijmo/wijmo.input';
import * as wjCore from 'wijmo/wijmo';
import * as wjGrid from 'wijmo/wijmo.grid';



import { UserService } from '../user.service';
import { isNull, isNullOrUndefined } from 'util';
import { MenuStrip } from '../controller/menustrip';
import { DropDown } from '../controller/dropdown';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';
import { BravoWebButton } from '../lib/ui/toolstrip/bravo.web.button';

@Component({
  selector: 'app-wijmo-grouping',
  templateUrl: './wijmo-grouping.component.html',
  styleUrls: ['./wijmo-grouping.component.css']
})
export class WijmoGroupingComponent implements OnInit {

  groupData: wjCore.CollectionView;
  columnName: wjCore.ObservableArray;
  groupingCol: wjCore.ObservableArray;
  _dataSources = [];
  _groupMenuItems = [];
  _bIsChecked = false;
  _totalColumns = [];
  _columnAvailable = ['ItemCode', 'ItemName', 'Unit', 'OpenInventory', 'OpenAmount'];
  _groupDescription = ['ItemName'];
  cv = new wjCore.CollectionView;
  gd = new wjCore.PropertyGroupDescription('OpenInventory')
  hostElem: HTMLElement;
  _menuStrip: any;
  _dropDownList = [];
  _parentNodeList = [];


  constructor(private userService: UserService,
    private elRef: ElementRef) {
  }

  ngOnInit() {
    this.getInitData();
    this.hostElem = document.getElementById('menuControl');
  }

  getInitData() {
    this.cv.groupDescriptions.push(this.gd);
    this.userService.getData().subscribe(data => {
      this._dataSources = data.splice(0, 1000);
      this.cv.sourceCollection = this._dataSources;

      let _item = data[0];
      for (const key in _item) {
        if (_item.hasOwnProperty(key)) {
          this._totalColumns.push(key);
        }
      }
    })
  }

  columnAvailableChanged(event: any) {
    if (event.target.checked) {
      this._columnAvailable.push(event.target.value);
      return;
    }

    this._columnAvailable.splice(this._columnAvailable.indexOf(event.target.value), 1);
  }

  checkColAvailable(col: string) {
    if (this._columnAvailable.indexOf(col) === -1)
      return false;
    return true;
  }

  groupDescriptionChanged(event: any) {
    if (event.target.checked) {
      this.cv.groupDescriptions.push(new wjCore.PropertyGroupDescription(event.target.value));
      return;
    }
    this.cv.groupDescriptions.forEach((item, idx) => {
      if (item.propertyName === event.target.value) {
        this.cv.groupDescriptions.splice(idx, 1);
        this.removeDropDown(this._dropDownList, idx, this.hostElem);
      }
    })
  }

  checkgroupDes(col: string): boolean {
    for (let i = 0; i < this.cv.groupDescriptions.length; i++) {
      if (this.cv.groupDescriptions[i].propertyName === col) {
        return true;
      }
    }
    return false;
  }


  flexInitialized(flex: wjGrid.FlexGrid) {
    flex.itemsSource = this.cv;


    flex.selectionChanged.addHandler((s, e: wjGrid.FormatItemEventArgs) => {
      let _row = flex.selectedRows[0];
      if (!isNullOrUndefined(_row) && this.cv.groupDescriptions.length > 0) {
        this._parentNodeList = [];
        this.getAllGroupRow(_row, this._parentNodeList);
      }
    })

    flex.loadedRows.addHandler(() => {
      let _row = flex.selectedRows[0];
      this.addNewDropDown(this._dropDownList, this.cv, this.hostElem);
    })
  }

  private addNewDropDown(pDropDownList: any, pCollectionView: wjCore.CollectionView, pHostElem: HTMLElement) {
    if (pDropDownList.length !== 0) {
      let _dropDown = new DropDown(document.createElement('div'));
      _dropDown.text = pCollectionView.groupDescriptions[pCollectionView.groupDescriptions.length - 1].propertyName;
      pHostElem.appendChild(_dropDown.hostElement);
      pDropDownList.push(_dropDown);
      return;
    }

    pCollectionView.groupDescriptions.forEach((groupDes) => {
      let _dropDown = new DropDown(document.createElement('div'));
      _dropDown.text = groupDes.propertyName;
      _dropDown.displayMemberPath = "_name";
      pHostElem.appendChild(_dropDown.hostElement);
      pDropDownList.push(_dropDown);
    })
  }

  private removeDropDown(pDropDownList: any, pnIndex: number, pHostElem: HTMLElement) {
    pHostElem.removeChild(pHostElem.childNodes[pnIndex]);
    pDropDownList.splice(pnIndex, 1);
  }

  private addItemsDropDown(pDropDownList: any, pNodeIsLevelList: any) {
    let _nIndex = 0;
    if (pDropDownList[0].itemsSource.length !== 0) {
      _nIndex = 1;
    }
    for (_nIndex; _nIndex < pNodeIsLevelList.length; _nIndex++) {
      pDropDownList[_nIndex].itemsSource.splice(0, pDropDownList[_nIndex].itemsSource.length);
      for (let i = 0; i < pNodeIsLevelList[_nIndex].length; i++) {
        pDropDownList[_nIndex].itemsSource.push(
          new ToolStrip(pNodeIsLevelList[_nIndex][i].index.toString(),
            document.createElement('div'), pNodeIsLevelList[_nIndex][i].dataItem.name.toString()));
      }
    }
  }

  public getAllGroupRow(pRow, pParentNodeList: any) {
    if (pRow instanceof (wjGrid.GroupRow)) {
      pParentNodeList.push(pRow);
      let parentNode = this.getParentNode(pRow);
      this.getAllGroupRow(parentNode, pParentNodeList);
    }
    else {
      if (isNull(pRow)) {
        return;
      }

      let parentNode = this.getParentNode(pRow);
      this.getAllGroupRow(parentNode, pParentNodeList);
    }
  }

  public getAllNodeIsLevel(pRow, pParentNodeList: any) {
    
  }

  public getParentNode(row) {
    // get row level
    let startLevel = row instanceof (wjGrid.GroupRow) ? row.level : null;
    let startIndex = row.index;

    // travel up to find parent node
    for (let i = startIndex - 1; i >= 0; i--) {
      let thisRow = row.grid.rows[i],
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
