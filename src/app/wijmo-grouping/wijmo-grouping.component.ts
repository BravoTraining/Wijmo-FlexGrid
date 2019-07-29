import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import * as wjInput from 'wijmo/wijmo.input';
import * as wjCore from 'wijmo/wijmo';
import * as wjGrid from 'wijmo/wijmo.grid';

import { DropDown } from '../controller/dropdown';

import { UserService } from '../user.service';
import { WjComponentResolvedMetadata } from 'wijmo/wijmo.angular2.directiveBase';
import { getDate } from 'ngx-bootstrap/chronos/utils/date-getters';
import { createVerify } from 'crypto';

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
  _groupDescription = ['ItemName', 'Unit'];
  cv = new wjCore.CollectionView;
  gd = new wjCore.PropertyGroupDescription('ItemName')
  
  

  constructor(private userService: UserService,
    private elRef: ElementRef) {
    
  }

  ngOnInit() {
    this.getInitData();

  }

  getInitData() {
 
    this.cv.groupDescriptions.push(this.gd);
    this.cv.groupDescriptions.push(new wjCore.PropertyGroupDescription('Unit'));
    this.userService.getData().subscribe(data => {
      this._dataSources = data.splice(0, 1000);
      this.initializeMenu(this._dataSources);
      this.groupData.groups.forEach((item, idx) => {
        this._groupMenuItems.push(item);
      });

      this.groupMenu.itemsSource = this._groupMenuItems;

      let _item = data[0];
      for (const key in _item) {
        if (_item.hasOwnProperty(key)) {
          this._totalColumns.push(key);

        }
      }
    })
  }


  initializeMenu(data: any) {
    this.groupData = new wjCore.CollectionView(data, {
      groupDescriptions: this._groupDescription
    });

    this.groupMenu.maxDropDownHeight = 300;
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
      this._groupDescription.push(event.target.value);
      this.initializeMenu(this._dataSources);
      return;
    }

    this._groupDescription.splice(this._groupDescription.indexOf(event.target.value), 1);
    this.initializeMenu(this._dataSources);
  }

  checkgroupDes(col: string) {
    if (this._groupDescription.indexOf(col) === -1)
      return false;
    return true;
  }

  onClickItem(menu: wjInput.Menu, grid: wjGrid.FlexGrid) {
    let _menuItem = menu.selectedItem;
    
    for (let i = menu.selectedIndex*this._groupDescription.length; i < grid.rows.length; i++) {
      let item = grid.rows[i];
      if (item instanceof wjGrid.GroupRow) {
        
        if(item.dataItem.name === _menuItem.name) {
          grid.select(new wjGrid.CellRange(i, 0), true);
          return;
        }
      }
    }
    grid.select(new wjGrid.CellRange(28, 0), true);
    
  }

  flexInitialized(flex: wjGrid.FlexGrid, menu: wjInput.Menu) {
    flex.selectionChanged.addHandler((s, e: wjGrid.FormatItemEventArgs) => {
      let item = flex.selectedRows[0];
      if (s.rows[e.row] instanceof wjGrid.GroupRow) {
        console.log(item.dataItem.isBottomLevel);
      }
      console.log(item);
      console.log(menu);
      console.log(this.cv.groupDescriptions)


    })
  }

  

  
}
