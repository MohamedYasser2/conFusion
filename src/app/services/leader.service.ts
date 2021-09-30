import { Injectable } from '@angular/core';
import { LEADERS } from '../shared/leaders';
import {Leader}from'../shared/leader';
import { Observable, of } from 'rxjs';
import { delay,catchError, map } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }
  getLeaders(): Observable<Leader[]>{
    return this.http.get<Leader[]>(baseURL+'leadership').pipe(catchError(this.processHTTPMsgService.handleError));

  }
  getFeaturedLeader(): Observable<Leader> {
    return this.http.get<Leader[]>(baseURL+'leadership?featured=true').pipe(map(leadership => leadership[0])).pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
