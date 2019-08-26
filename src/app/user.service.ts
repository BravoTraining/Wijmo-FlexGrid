import { Injectable, OnInit } from '@angular/core';

import { userDB } from './users-data-fake';
import { User, Roles } from './model/user';

import { Observable, of, timer, Subject, } from 'rxjs';
import { catchError, tap, filter, map, delay, debounceTime, switchMap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Base64 } from './model/base64';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private getUsersURL = "http://localhost:3000/users";
  private apiBase64 = "http://localhost:55061/api/base64/";
  private apiRtf = "http://localhost:55061/api/nrtf";
  private apiSerialize = "http://localhost:44350//api/helper/serializelist";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=UTF-8'
    })
  };


  constructor(private http: HttpClient) {
  
  }

  getApiBase64(_zBase64Txt: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post<string>(this.apiBase64, '"' + _zBase64Txt + '"', {headers, responseType: 'text'}).pipe(
      catchError(err => of(""))
    );
  }

  getApiHtml(): Observable<string> {
    return this.http.get<string>(this.apiRtf).pipe(
      catchError(err => of(""))
    );
  }

  serializeList(arr: string[]): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post<string>(this.apiSerialize, arr, {headers, responseType: 'text'}).pipe(
      catchError(err => of(""))
    )
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.getUsersURL).pipe(
      catchError(err => of([]))
    );
  }

  getUserById(id: number): Observable<User> {
    const userUrl = `${this.getUsersURL}/${id}`;
    return this.http.get<User>(userUrl).pipe(
      catchError(error => of(new User()))
    );
  }

  updateUser(user: User): Observable<any> {
    const url = `${this.getUsersURL}/${user.id}`;
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };

    return this.http.put(url, user, this.httpOptions).pipe(
      catchError(error => of(new User()))
    );
  }

  //GET jsondata in local
  private jsonUrl = '../assets/user-list.json';
  private jsonRoles = '../assets/roles.json';
  private jsonData = '../assets/data_nxt.json';
  private _treeDataJson = '../assets/tree_data.json';

  getJsonData(): Observable<any> {
    return this.http.get(this.jsonUrl);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonRoles).pipe(delay(1000));
  }

  getTreeData(): Observable<any[]> {
    return this.http.get<any[]>(this._treeDataJson);
  }

  getData(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonData);
  }


}

