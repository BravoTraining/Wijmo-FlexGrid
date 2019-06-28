import { Component, OnInit, Input } from '@angular/core';
import { User } from '../model/user';
import { UserService } from '../user.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/public_api';
import { TestObject } from 'protractor/built/driverProviders';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  user: User;
  usersConst: User[];
  usersCurrent: User[];
  pageLength: number;


  constructor(private userService: UserService) { }

  getUserList(){
    this.userService.getUsers()
    .subscribe(listUsers => 
      { this.usersConst = listUsers;
        this.pageLength = listUsers.length;
        this.usersCurrent = this.usersConst.slice(0,10)
    });
  }

  ngOnInit() {
    this.getUserList();
  }

  onChangePage(event: PageChangedEvent): void{
    const pageStart = (event.page - 1) * event.itemsPerPage
    const pageEnd = event.page * event.itemsPerPage;
    this.usersCurrent = this.usersConst.slice(pageStart, pageEnd);
  }
}
