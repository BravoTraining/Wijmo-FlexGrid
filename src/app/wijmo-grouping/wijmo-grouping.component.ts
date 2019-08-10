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
import { BravoGrouppath } from '../bravo.grouppath';


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

  ngOnInit() {
    this.getInitData();
    this.hostElem = document.getElementById('menuControl');
  }

  public ngAfterViewInit() {
    // this.groupPath.itemsSource.push(new ToolStrip("0", null, "Vật tư 0000"));
    this.menuGroupPath.bMouseHoverDisable = true;

  }

  getInitData() {
    // this.cv.groupDescriptions.push(this.gd);
    this.cv.groupDescriptions.push(new wjCore.PropertyGroupDescription('ItemCode'));
    this.userService.getData().subscribe(data => {
      this._dataSources = data.splice(0, 10000);
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
        this.brGroupPath.removeControl(this.menuGroupPath, item.propertyName);
        this.cv.groupDescriptions.splice(idx, 1);
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


  flexInitialized(flex: wjGrid.FlexGrid) {
    flex.itemsSource = this.cv;
    this.brGroupPath = new BravoGrouppath(document.createElement('div'), flex);
    flex.selectionChanged.addHandler((s, e: wjGrid.FormatItemEventArgs) => {
      let _row = flex.selectedRows[0];
      if (!isNullOrUndefined(_row) && this.cv.groupDescriptions.length > 0) {
        this._parentNodeList = [];
        // this.getAllNodeIsLevel(_row, this._dropDownList, this._parentNodeList);
        // this.setVisibleDropDown(this._parentNodeList, this._dropDownList);
        // this.setHeaderDisplay(this._dropDownList, this._parentNodeList);
        this.brGroupPath.setComboBoxItems(_row, this.menuGroupPath)
        // this.getNodeChild(_row, this._dropDownList, 0, 0, 0);
      }
      console.log(flex)
    })

    flex.loadedRows.addHandler((s) => {

      // this.dropDownChanged(this._dropDownList, this.cv, this.hostElem);
      this.brGroupPath.createNewGroupPath(this.menuGroupPath);
      // this.setVisibleDropDown(this._parentNodeList, this._dropDownList);
    })

  }


  private dropDownChanged(pDropDownList: any, pCollectionView: wjCore.CollectionView, pHostElem: HTMLElement) {
    let _lenDropDown = pDropDownList.length;
    let _lenGroupDes = pCollectionView.groupDescriptions.length;

    if (_lenDropDown === 1 && _lenGroupDes === 0) {
      pDropDownList.splice(0, 1);
      pHostElem.removeChild(pHostElem.childNodes[0]);
      return;
    }
    // remove group
    if (_lenDropDown > _lenGroupDes) {
      for (let i = 0; i < _lenDropDown; i++) {
        if (pDropDownList[i].text !== pCollectionView.groups[i].name) {
          pDropDownList.splice(i, 1);
          this.menuGroupPath.itemsSource.splice(i, 1)
          pHostElem.removeChild(pHostElem.childNodes[i]);
          break
        }
      }
      return;
    }

    // add new group
    if (pDropDownList.length !== 0 && _lenGroupDes > 0) {
      let _dropDown = new wjInput.ComboBox(document.createElement('div'));
      // _dropDown.text = pCollectionView.groupDescriptions[pCollectionView.groupDescriptions.length - 1].propertyName;
      pHostElem.appendChild(_dropDown.hostElement);
      pDropDownList.push(_dropDown);
      this.menuGroupPath.itemsSource.push(_dropDown)

      return;
    }

    // load group default
    pCollectionView.groupDescriptions.forEach((groupDes) => {
      let _dropDown = new wjInput.ComboBox(document.createElement('div'));
      // _dropDown.text = groupDes.propertyName;
      _dropDown.displayMemberPath = "text";
      pHostElem.appendChild(_dropDown.hostElement);
      pDropDownList.push(_dropDown);
      this.menuGroupPath.itemsSource.push(_dropDown)
    })

  }

  private setVisibleDropDown(pParentNodeList: any, pDropDownList: any) {
    for (let i = 0; i < pDropDownList.length; i++) {
      pDropDownList[i].hostElement.removeAttribute("hidden");
      if (i <= pParentNodeList.length) {
        continue;
      }
      pDropDownList[i].hostElement.setAttribute("hidden", "true");
    }
  }

  private setHeaderDisplay(pDropDownList: any, pParentNodeList) {
    for (let i = 0; i < pParentNodeList.length; i++) {
      pDropDownList[pParentNodeList.length - 1 - i].header = pParentNodeList[i].dataItem.name.toString();
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

  public getAllNodeIsLevel(pRow, pDropDownList: any, pParentNodeList: any) {
    this.getAllGroupRow(pRow, pParentNodeList);

    if (pParentNodeList.length === 0) {
      return;
    }

    let _nIndex = -1;
    let _nLenParentNode = pParentNodeList.length;

    for (let i = 0; i < _nLenParentNode; i++) {
      // First load item to dropdown
      if (pDropDownList[0] === undefined) {
        _nIndex = 0;

        this.getNodeChild(pRow, this._dropDownList, _nIndex, 0, 0);

        if (pDropDownList.length > 1) {
          this.getNodeChild(pRow, this._dropDownList, _nIndex, 1, 1);
        }
      }

      if (this._dropDownList[0].itemsSource.length !== 0) {
        _nIndex = pParentNodeList[i].index + 1;
        //get level current
        let _thisRow = pRow.grid.rows[_nIndex];
        let _currentLevel = _thisRow instanceof (wjGrid.GroupRow) ? _thisRow.level : null;

        if (_currentLevel === null) {
          continue;
        }

        // Remove all node old in dropdown item
        let _totalItems = this._dropDownList[_nLenParentNode - i].itemsSource.length;
        if (_totalItems > 0) {
          this._dropDownList[_nLenParentNode - i].itemsSource.splice(0, _totalItems);
        }

        // Add new item to dropdown
        this.getNodeChild(pRow, this._dropDownList, _nIndex, _nLenParentNode - i, _currentLevel);
      }
    }
  }

  public getNodeChild(pRow, pDropDownList: any, pnIndex: number, pnIdxDropDown: number, pLevel: number) {
    // travel find node is group row from parent node position
    for (let i = pnIndex; i < pRow.grid.rows.length; i++) {
      let _thisRow = pRow.grid.rows[i];

      let _thisLevel = _thisRow instanceof (wjGrid.GroupRow) ? _thisRow.level : null;

      if (_thisLevel !== null && _thisLevel < pLevel) {
        break;
      }

      // Add row group of level to dropdown
      if (_thisLevel === pLevel) {
        i += _thisRow.dataItem.items.length;
        pDropDownList[pnIdxDropDown].itemsSource.push(new ToolStrip(
          _thisRow.index.toString(),
          document.createElement('div'),
          _thisRow.dataItem.name.toString()
        ));
      }
    }
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
