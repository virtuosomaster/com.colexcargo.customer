import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

import { AuthConstants } from '../config/auth-constants';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  userShipments$ = new BehaviorSubject<any>([]);

  public shipmentList: any;

  constructor(
    private storageService: StorageService,
    private httpService: HttpService,
    private auth: AuthService
  ) { }

  sortObjectsArrayByProperty(arr: any[], prop: string): void {
    arr.sort((a: any, b: any) => {
      return Number(a[prop]) - Number(b[prop]);
    });
  }

  post(serviceName: String, data: any): Observable<any> {
    return this.httpService.post(serviceName, data);
  }
  get(apiKey: string, route: String): Observable<any> {
    return this.httpService.get(apiKey, route);
  }
  searchShipment(apiKey: string, postData: any): Observable<any> {
    return this.httpService.searchShipment(apiKey, postData);
  }
  page(apiKey: string, page: number): Observable<any> {
    return this.httpService.page(apiKey, page);
  }
  getShipmentByID(apiKey: string, ID: number): Observable<any> {
    return this.httpService.getShipmentByID(apiKey, ID);
  }
  getShipmentsAllStatus(apiKey: string): Observable<any> {
    return this.httpService.getShipmentsAllStatus(apiKey);
  }
  pageByStatus(apiKey: string, page: number, status: string): Observable<any> {
    return this.httpService.pageByStatus(apiKey, page, status);
  }
  createShipment(key: String, postData: any): Observable<any> {
    return this.httpService.post(key + '/shipment/add', postData);
  }

  getPODSettings(apiKey: string): Observable<any> {
    return this.httpService.getPODSettings(apiKey);
  }

  requestChangePass(postData: any): Observable<any> {
    return this.httpService.requestChangePass(postData);
  }

  signUp(postData: any): Observable<any> {
    return this.httpService.signUp(postData);
  }

  addTicket(apiKey: String, postData: any): Observable<any> {
    return this.httpService.post(apiKey + '/ticket/add', postData);
  }

  addClaim(apiKey: String, postData: any): Observable<any> {
    return this.httpService.post(apiKey + '/claim/add', postData);
  }

  getSupportsAll(apiKey: string, page: number): Observable<any> {
    return this.httpService.getSupportsAll(apiKey, page);
  }
  getClaimsAll(apiKey: string, page: number): Observable<any> {
    return this.httpService.getClaimsAll(apiKey, page);
  }

  getDriverDetails(apiKey: String) {
    return this.httpService.getDriverDetails(apiKey);
  }
  getRecentShipments(apiKey: any) {
    return this.httpService.getRecentShipments(apiKey);
  }

}
