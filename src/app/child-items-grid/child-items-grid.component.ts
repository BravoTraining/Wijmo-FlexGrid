import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../user.service';

import * as wjcGrid from 'wijmo/wijmo.grid';
import * as wjcInput from 'wijmo/wijmo.input';
import * as wjcCore from 'wijmo/wijmo';
import { isNullOrUndefined } from 'util';
import { BravoGroupPathComponent } from '../bravo-group-path/bravo-group-path.component';
import { BravoGrouppath } from '../bravo.grouppath';

class CustomMergeManager extends wjcGrid.MergeManager {
  constructor(flexGrid: wjcGrid.FlexGrid) {
    super(flexGrid);
  }

  getMergedRange(panel: wjcGrid.GridPanel, r: number, c: number, clip: boolean = true) {
    let rg = new wjcGrid.CellRange(r, c);

    let panelChildren = panel.rows[rg.row].hasChildren;
    let panelColHeader = 2;

    if ((panelChildren || panel.cellType == panelColHeader)) {
      for (let i = rg.col; i < panel.columns.length - 1; i++) {

        let currentCellData = panel.getCellData(rg.row, i, true);
        let nextCellData = panel.getCellData(rg.row, i + 1, true);

        if (currentCellData != nextCellData) {
          if ((this.checkCellEmptyOrZero(nextCellData))) {
            rg.col2 = i + 1;
          }
          else {
            break;
          }
        }
        rg.col2 = i + 1;
      }

      for (let i = rg.col; i > 0; i--) {
        let currentCellData = panel.getCellData(rg.row, i, true);
        let previousCellData = panel.getCellData(rg.row, i - 1, true);
        if (currentCellData != previousCellData) {
          if ((i >= columnPos) && this.checkCellEmptyOrZero(currentCellData)) {
            rg.col = i - 1;
          }
          else { break; }
        }
        rg.col = i - 1;
      }
    }

    if (panel.cellType == panelColHeader) {
      for (let i = rg.row; i < panel.rows.length - 1; i++) {
        let currentCellData = panel.getCellData(i, rg.col, true);
        let nextCellData = panel.getCellData(i + 1, rg.col, true);
        if (currentCellData !== nextCellData)
          break;
        rg.row2 = i + 1;
      }

      for (let i = rg.row; i > 0; i--) {
        let currentCellData = panel.getCellData(i, rg.col, true);
        let previoustCellData = panel.getCellData(i - 1, rg.col, true);
        if (currentCellData != previoustCellData)
          break;
        rg.row = i - 1;
      }
    }
    return rg;
  }

  checkCellEmptyOrZero(data) {
    if (data == 0 || data == '') {
      return true;
    }
    return false;
  }
}

const columnPos = 1;


@Component({
  selector: 'app-child-items-grid',
  templateUrl: './child-items-grid.component.html',
  styleUrls: ['./child-items-grid.component.css'],
})
export class ChildItemsGridComponent implements OnInit, AfterViewInit {
  data: any[];
  parentItems: any[];
  treeData = [];
  child: any[];
  addRow: true;
  bra = "bravo";
  flag = 0;
  isHidden = false;
  brGroupPath: BravoGrouppath;

  collectionView: wjcCore.CollectionView;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.getInitData();
    
  }

  // @ViewChild('childItem') flex: wjcGrid.FlexGrid;
  @ViewChild('childItem', {static: true}) flex: wjcGrid.FlexGrid;
  @ViewChild('menuGroupPath', {static: false}) menu: BravoGroupPathComponent;

  flexInitialized(flexgrid: wjcGrid.FlexGrid) {
    flexgrid.mergeManager = new CustomMergeManager(flexgrid);
    flexgrid.childItemsPath = "children";
    this.brGroupPath = new BravoGrouppath(document.createElement('div'), flexgrid, 1);
    // flexgrid.isReadOnly = false;
    this.loadedRows();
    this.mergeHeader(flexgrid);
    this.formatItem();

    flexgrid.loadedRows.addHandler(() => {
      // this.brGroupPath.createNewGroupPath(this.menu);

      // flexgrid.rows.forEach((row) => {
        // console.log(row instanceof wjcGrid.GroupRow)
      // })
    })

    flexgrid.selectionChanged.addHandler(() => {
      let _row = flexgrid.selectedRows[0];
      this.brGroupPath.setComboBoxItems(_row, this.menu);
    })
  }

  mergeHeader(flexGrid: wjcGrid.FlexGrid) {
    let extraRows = new wjcGrid.Row();

    let panel = flexGrid.columnHeaders;
    panel.rows.splice(0, 0, extraRows);

    for (let idxCol = 3; idxCol <= 4; idxCol++) {
      panel.setCellData(0, idxCol, "Đầu kỳ");
    }
    for (let idxCol = 5; idxCol <= 6; idxCol++) {
      panel.setCellData(0, idxCol, "Nhập");
    }
    for (let idxCol = 7; idxCol <= 8; idxCol++) {
      panel.setCellData(0, idxCol, "Xuất");
    }

    for (let idxCol = 9; idxCol <= 10; idxCol++) {
      panel.setCellData(0, idxCol, "Cuối kỳ");
    }

    let binding = ['ItemCode', 'ItemName', 'Unit'];

    binding.forEach(function (binding) {
      let col = flexGrid.getColumn(binding);
      panel.setCellData(0, col.index, col.header);
    })
  }

  cvChange() {
    this.collectionView.currentChanged.addHandler(this.currentChange.bind(this));
  }

  loadedRows() {
    this.flex.loadedRows.addHandler(this.loaded.bind(this));
  }

  formatItem() {
    this.flex.formatItem.addHandler(this.format.bind(this));
  }

  loaded(sender) {
    sender.rows.forEach(function (row) {
      row.isReadOnly = false;
    })


  }

  currentChange() {
    if (this.collectionView.isAddingNew)
      console.log(this.collectionView.currentAddItem);
  }

  format(s: wjcGrid.FlexGrid, e: wjcGrid.FormatItemEventArgs) {
    if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
      var html = e.cell.innerHTML;
      e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
    }

    if (e.panel == s.columnHeaders) {
      e.cell.className = "wj-cell wj-header wj-align-center";
    }

    if (s.cells == e.panel) {
      
      

      if (e.panel.rows[e.row].hasChildren) {
        e.panel.rows[e.row].cssClass = 'boldRow';
        e.panel.rows[e.row].isReadOnly = true;
      }

      if (s.columns[e.col].index == e.panel.columns.firstVisibleIndex) {
        e.cell.style.paddingLeft = '20px';
        if (s.rows[e.row].hasChildren) {
          e.cell.innerHTML = '';
        }
      }

      if (e.cell.textContent == '0') {
        e.cell.textContent = '';
      }

      if (s.columns[e.col].index == columnPos && e.panel.rows[e.row].hasChildren) {
        var html = e.cell.innerHTML;
        if (s.rows[e.row].isCollapsed) {
          e.cell.innerHTML = `<button class="wj-btn wj-btn-glyph wj-elem-collapse" type="button" tabindex="-1" aria-label="Toggle Group" aria-expanded="true">
    <span class="wj-glyph-right"></span></button>`  + html;
        }
        else {
          e.cell.innerHTML = `<button class="wj-btn wj-btn-glyph wj-elem-collapse" type="button" tabindex="-1" aria-label="Toggle Group" aria-expanded="true">
    <span class="wj-glyph-down-right"></span></button>`  + html;
        }
      }

      if (s.rows[e.row].level !== 0 && s.columns[e.col].index == columnPos) {
        let level = s.rows[e.row].level * 20 + 'px';
        e.cell.style.paddingLeft = level;
      }
    }
  }

  treeView() {
    this.buildTreeFromCollection(this.collectionView);
    this.isHidden = !this.isHidden;
    // this.flex.rows.forEach((row) => {
    //   if (row.hasChildren) {
    //     console.log(row);
    //   }
      
      
    // })
  }

  gridView() {
    this.unBuildTreeFromCollection(this.collectionView);
    this.isHidden = !this.isHidden;

  }

  getInitData() {
    this.userService.getData().subscribe(data => {
      this.data = data;
      this.collectionView = new wjcCore.CollectionView(this.data);
      this.buildTreeFromCollection(this.collectionView);
      
    })
  }

  convertArrayToTreeData(array) {
    let treeData = [];
    let mappedArray = {};
    let arrayElement;
    let mappedElement;

    for (let i = 0; i < array.length; i++) {
      arrayElement = array[i];
      mappedArray[arrayElement.Id] = arrayElement;
      mappedArray[arrayElement.Id]['children'] = [];
    }

    for (const key in mappedArray) {
      if (mappedArray.hasOwnProperty(key)) {
        mappedElement = mappedArray[key];
        if (mappedElement.ParentId !== -1) {
          mappedArray[mappedElement['ParentId']]['children'].push(mappedElement);
        }
        else {
          treeData.push(mappedElement);
        }
      }
    }
    return treeData;
  }


  buildTreeFromCollection(collectionView) {
    collectionView.beginUpdate();
    let index = collectionView.items.length - 1;
    let totalChild = 0;
    collectionView.items.sort((obj1, obj2) => this.sortByGroupOrder(obj1, obj2));

    for (let idx = 0; idx <= index; idx++) {
        collectionView.items[idx]['children'] = [];
    }

    while (index >= 0) {
      let item = collectionView.items[index];
      if (item.ParentId === -1) {
        if (totalChild !== 0) {
          collectionView.items.splice((index + 1), totalChild);
        }
        index--;
        totalChild = 0;
        continue;
      }

      for (let idxParent = index - 1; idxParent >= 0; idxParent--) {
        let parent = collectionView.items[idxParent];
        let child = collectionView.items[index];
        if (parent.Id === child.ParentId) {
          parent.children.push(child);
          break;
        }
      }
      totalChild++;
      index--;
    }
    collectionView.endUpdate();
  }

  sortByGroupOrder(obj1, obj2) {
    let groupOrder1 = obj1._GroupOrder.toLowerCase();
    let groupOrder2 = obj2._GroupOrder.toLowerCase();

    if (groupOrder1 > groupOrder2) {
      return 1;
    }

    if (groupOrder1 < groupOrder2) {
      return -1;
    }

    return 0;
  }

  unBuildTreeFromCollection(collectionView) {
    collectionView.beginUpdate();
    let index = collectionView.items.length - 1;

    while (index >= 0) {
      let parentItem = collectionView.items[index];
      if (parentItem.children.length > 0) {
      this.pushChild(collectionView, parentItem)
      }
      delete parentItem.children;
      index--;
    }
    collectionView.endUpdate();
  }

  pushChild(collectionView, parentItem) {
    for (let i = 0; i < parentItem.children.length; i++) {
      let child = parentItem.children[i];
      collectionView.items.push(child);
      if (child.children.length > 0) this.pushChild(collectionView, child);
      delete child.children;
    }
  }


  // @ViewChild('dropdown', {static:false}) menu: wjcInput.Menu;

  public ngAfterViewInit() {
    // this.menu.itemsSource = ['New', 'Open', 'Save', 'Exit'];
  }
}
