import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';


import { adminUser } from '../model/user';


import { ActivatedRoute, Router} from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  adminAcc = adminUser;
  formLogin: FormGroup;
  username = '';
  password = '';
  isError = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private location: Location ) { }

  ngOnInit() {

    this.formLogin =this.fb.group({
      username: '',
      password: ''
    })
  }

  onSubmit(){
    this.username = this.formLogin.get('username').value;
    this.password = this.formLogin.get('password').value;
    if(this.checkAccount(this.adminAcc, this.username, this.password)){
      this.router.navigateByUrl("/users");
    }
    else{
      this.isError = !this.isError;
    }
  }

  checkAccount(adminAcc, username, password): boolean{
    const index = adminAcc
      .findIndex( acc => acc.username === username);
    
    if(index !== -1 && adminAcc[index].password === password){
      return true;
    }
    return false;
  }


}
