import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

import * as wjInput from 'wijmo/wijmo.input';
import * as wjCore from 'wijmo/wijmo';
import * as wjGrid from 'wijmo/wijmo.grid';



import { UserService } from '../user.service';
import { isNull, isNullOrUndefined } from 'util';
import { MenuStrip } from '../controller/menustrip';
import { DropDown } from '../controller/dropdown';
import { ToolStrip } from '../lib/ui/toolstrip/toolstrip';
import { BravoGroupPathComponent } from '../bravo-group-path/bravo-group-path.component'
import { _DonutSegment } from 'wijmo/wijmo.chart';
import { BravoGrouppath } from '../BravoClass/bravo.grouppath';
import { BravoWebGrid, GroupColumnItem } from '../lib/ui/controls/bravo.web.grid';
import { Dictionary, SortOrder, AggregateEnum, AlignmentEnum } from '../lib/core/core';


@Component({
  selector: 'app-wijmo-grouping',
  templateUrl: './wijmo-grouping.component.html',
  styleUrls: ['./wijmo-grouping.component.css']
})
export class WijmoGroupingComponent implements OnInit, AfterViewInit {

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
  gd = new wjCore.PropertyGroupDescription('Unit')
  hostElem: HTMLElement;
  _menuStrip: MenuStrip;
  _dropDownList = [];
  _parentNodeList = [];
  brGroupPath: BravoGrouppath;

  constructor(private userService: UserService,
    private elRef: ElementRef) {
  }

  @ViewChild("menuGroupPath", { static: false }) menuGroupPath: BravoGroupPathComponent;
  @ViewChild("flexGroup", {static: false}) flex: BravoWebGrid;

  ngOnInit() {
    this.getInitData();
    this.hostElem = document.getElementById('menuControl');
  }

  public ngAfterViewInit() {
    this.menuGroupPath.bMouseHoverDisable = true;

      this.menuGroupPath.itemsSource.push(new ToolStrip("1", null, `<img src="http://bravo8.bravo.com.vn/assets/img/DockRight.png" alt="" style="width: 16px;">`));
      this.menuGroupPath.setAlignment(this.menuGroupPath.itemsSource[0], AlignmentEnum.Right);
      this.menuGroupPath.itemsSource.push(new ToolStrip("2", null, `<img src="http://bravo8.bravo.com.vn/assets/img/DockBottom.png" alt="" style="width: 16px;">`));
      this.menuGroupPath.setAlignment(this.menuGroupPath.itemsSource[1], AlignmentEnum.Right);
  
  }

  getInitData() {
    this.userService.getData().subscribe(data => {
      this._dataSources = data.splice(0, 5000);
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
      // this.cv.groupDescriptions.push(new wjCore.PropertyGroupDescription(event.target.value));
  
        this.flex.groupBy(event.target.value);
      return;
    }
    this.cv.groupDescriptions.forEach((item, idx) => {
      if (item.propertyName === event.target.value) {
        // this.cv.groupDescriptions.splice(idx, 1);
        this.flex.clearGroup(event.target.value);

        return;
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


  flexInitialized(flex: BravoWebGrid) {
    flex.itemsSource = this.cv;
    flex.bAllowRaisingUpdateGroupsEvents = true;
    flex.groupBy("Unit");
    this.brGroupPath = new BravoGrouppath(this.menuGroupPath, flex);

    // flex.groupBy("ItemName");
    // flex.groupBy("OpenInventory");

  }
}