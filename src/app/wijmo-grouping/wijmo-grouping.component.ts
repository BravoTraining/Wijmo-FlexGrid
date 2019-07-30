import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import * as wjInput from 'wijmo/wijmo.input';
import * as wjCore from 'wijmo/wijmo';
import * as wjGrid from 'wijmo/wijmo.grid';

import { DropDown } from '../controller/dropdown';

import { UserService } from '../user.service';
import { WjComponentResolvedMetadata } from 'wijmo/wijmo.angular2.directiveBase';
import { getDate } from 'ngx-bootstrap/chronos/utils/date-getters';
import { createVerify } from 'crypto';
import { isNull } from 'util';

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
  gd = new wjCore.PropertyGroupDescription('ItemName')
  hostElem: HTMLElement;



  constructor(private userService: UserService,
    private elRef: ElementRef) {

  }

  ngOnInit() {
    this.getInitData();
    this.hostElem = document.getElementById('menuControl');
    let drop = new DropDown(this.hostElem, this._groupMenuItems);
    console.log(this.hostElem);
    console.log(drop)

  }

  getInitData() {
    // this._groupDescription.forEach((item) => {
    //   this.cv.groupDescriptions.push(new wjCore.PropertyGroupDescription(item));
    // })
    this.cv.groupDescriptions.push(this.gd);
    this.userService.getData().subscribe(data => {
      this._dataSources = data.splice(0, 1000);
      this.cv.sourceCollection = this._dataSources;

      this.cv.groups.forEach((item) => {
        this._groupMenuItems.push(item);
      })

      this.groupMenu.itemsSource = this._groupMenuItems;

      let _item = data[0];
      for (const key in _item) {
        if (_item.hasOwnProperty(key)) {
          this._totalColumns.push(key);
        }
      }
    })
  }


  initializeMenu(menu: wjInput.Menu) {
    this.groupMenu.maxDropDownHeight = 250;
  }

  @ViewChild('groupItems', { static: false }) groupItem: wjGrid.FlexGrid;
  @ViewChild('groupMenu', { static: false }) groupMenu: wjInput.Menu;

  columnAvailableChange(event: any) {
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

  onClickItem(menu: wjInput.Menu, grid: wjGrid.FlexGrid) {
    let _menuItem = menu.selectedItem;

    for (let i = menu.selectedIndex * this.cv.groupDescriptions.length; i < grid.rows.length; i++) {
      let item = grid.rows[i];
      if (item instanceof wjGrid.GroupRow) {

        if (item.dataItem.name === _menuItem.name) {
          grid.select(new wjGrid.CellRange(i, 0), true);
          return;
        }
      }
    }
  }

  flexInitialized(flex: wjGrid.FlexGrid, menu: wjInput.Menu) {
    flex.itemsSource = this.cv;

    flex.selectionChanged.addHandler((s, e: wjGrid.FormatItemEventArgs) => {
        let row = flex.selectedRows[0];
        let currentNode = [];
        this.getAllParentNode(row, currentNode);
        menu.text = currentNode[currentNode.length - 1].dataItem.name;
    })

    new DropDown(this.hostElem, this.cv.sourceCollection);
  }

  public getAllParentNode(row, currentNode: any) {
    let parentNode = this.getParentNode(row);
    if (parentNode != null && parentNode.level > 0) {
      currentNode.push(parentNode)
      this.getAllParentNode(parentNode, currentNode);
    }

    if (isNull(parentNode)) {
      currentNode.push(row)
      return;
    }

    if (parentNode.level === 0) {
      currentNode.push(parentNode);
      return;
    }

  }

  public getAllNodeIsLevel(row) {

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
