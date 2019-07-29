import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../user.service';

import * as wjcGrid from 'wijmo/wijmo.grid';
import * as wjcInput from 'wijmo/wijmo.input';
import * as wjcCore from 'wijmo/wijmo';
import { filter, map, debounceTime, switchMap } from 'rxjs/operators';
import { Roles } from '../model/user';
import { fromEvent, Subscription, timer, Subject, Observable } from 'rxjs';


@Component({
  selector: 'app-wijmo-example',
  templateUrl: './wijmo-example.component.html',
  styleUrls: ['./wijmo-example.component.css']
})
export class WijmoExampleComponent implements OnInit {
  data: any[];
  selectedItem: any;
  dataRoles: Roles[];
  roles: Roles[];
  roleDetail: string;
  rowIndex = -1;
  id: any;

  

  private subscription: Subscription;
  private myService = new Subject();

  constructor(private userService: UserService) {

     }

  ngOnInit() {
    this.getData();
    this.getRoles();
    this.flex.select(-1, -1);
    this.myService.pipe(
      debounceTime(100),
      switchMap( e => this.userService.getRoles()))
      .subscribe(roles => {this.dataRoles = roles.filter(role => role.id === this.id)
      })
  }

  @ViewChild('mainData', {static: true}) flex: wjcGrid.FlexGrid;

  initData() {
    new wjcGrid.FlexGrid('#roleList', {
      autoGenerateColumns: false,
      columns: [
        {header: 'Id', binding: 'id', width: '*'},
        {header: 'Role', binding: 'role', width: '*'},
        {header: 'Permission', binding: 'permission', width: '*'},
      ],
      itemsSource: this.roles
    });
    
  }
  
  getData() {
    return this.userService.getJsonData().subscribe(value => this.data = value);
  }

  getRoles() {
    return this.userService.getRoles()
        .subscribe(role => {this.roles = role;
          this.initData();
    });
  }

  flexInitialized(flexgrid: wjcGrid.FlexGrid) {
    flexgrid.selectionChanged.addHandler(() => {
      if (this.rowIndex !== flexgrid.selection.row) {
        this.rowIndex = flexgrid.selection.row;
        this.itemSelected();
      }
    });

    flexgrid.formatItem.addHandler(function(s: wjcGrid.FlexGrid, e: wjcGrid.FormatItemEventArgs) {
      if (e.panel == s.cells && s.columns[e.col].binding == 'address') {
        var item = s.rows[e.row].dataItem;
  
        if(item.address == "Hà Nội") {
          e.cell.style.backgroundColor='green';
        }
        else {
          e.cell.style.removeProperty('background-color');
        }
      }
    })
  }
  
  itemSelected() {
    this.selectedItem = this.flex.collectionView.currentItem;
    this.id = this.selectedItem.role_id;
    this.myService.next();
  }

}
