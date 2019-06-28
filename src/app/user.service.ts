import { Injectable, OnInit } from '@angular/core';

import { userDB } from './users-data-fake';
import { User, Roles } from './model/user';

import { Observable, of, timer, Subject, } from 'rxjs';
import { catchError, tap, filter, map, delay, debounceTime, switchMap } from 'rxjs/operators';

import { HttpClient, HttpHeaders} from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private getUsersURL ="http://localhost:3000/users";
  
  constructor(private http: HttpClient) {

   }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.getUsersURL).pipe(
      catchError(err => of([]))
    );
  }

  getUserById(id: number): Observable<User>{
    const userUrl = `${this.getUsersURL}/${id}`;
    return this.http.get<User>(userUrl).pipe(
      catchError(error => of(new User()))
    );
  }

  updateUser(user: User): Observable<any>{
    const url = `${this.getUsersURL}/${user.id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
   
   return this.http.put(url, user, httpOptions).pipe(
      catchError(error => of(new User()))
   );
  }

  //GET jsondata in local
  private jsonUrl = '../assets/user-list.json';
  private jsonRoles = '../assets/roles.json';
  private jsonData = '../assets/data_nxt.json';

  getJsonData(): Observable<any> {
    return this.http.get(this.jsonUrl);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonRoles).pipe(delay(1000));
  }

  getData(): Observable<any[]>{
    return this.http.get<any[]>(this.jsonData);
  }

  
}

