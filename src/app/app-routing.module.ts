import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UsersComponent } from './users/users.component';


const routers: Routes = [
  {path: "users", component: UsersComponent},
  {path: "users/detail/:id", component: UserDetailComponent},
  {path: "login", component: LoginComponent}
  // {path: "", redirectTo: '/login', pathMatch: 'full'}
];


@NgModule({
  // declarations: [],
  imports: [
    RouterModule.forRoot(routers)
  ],

  exports: [RouterModule]
})
export class AppRoutingModule { }
