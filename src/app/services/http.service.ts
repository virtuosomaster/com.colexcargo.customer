import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  headers = new HttpHeaders();
  options = { headers: this.headers, withCredintials: false };

  constructor(
    private http: HttpClient,
  ) { }

  post(serviceName: String, data: any) {
    const url = environment.apiUrl + serviceName;
    return this.http.post(url, data, this.options);
  }
  get(apiKey: String, route: String) {
    const url = environment.apiUrl + apiKey + route;
    return this.http.get(url, this.options);
  }
  searchShipment(apiKey: string, data: any) {
    const url = environment.apiUrl + apiKey + '/pod/search/';
    return this.http.post(url, data, this.options);
  }
  getShipmentsAllStatus(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/shipments/status/all';
    return this.http.get(url, this.options);
  }
  page(apiKey: String, page: number) {
    const url = environment.apiUrl + apiKey + '/pod/status/all/' + page;
    return this.http.get(url, this.options);
  }
  pageByStatus(apiKey: String, page: number, status: string) {
    const url = environment.apiUrl + apiKey + '/shipment/status/' + status + '/page/' + page;
    return this.http.get(url, this.options);
  }
  getShipmentByID(apiKey: String, ID: number) {
    const url = environment.apiUrl + apiKey + '/pod/shipment/' + ID;
    return this.http.get(url, this.options);
  }
  getPODSettings(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/settings/';
    return this.http.get(url, this.options);
  }
  requestChangePass(postData: any) {
    const url = environment.apiUrl + 'lost-password';
    return this.http.post(url, postData, this.options);
  }

  signUp(postData: any) {
    const url = environment.apiUrl + 'register_user';
    return this.http.post(url, postData, this.options);
  }

  getSupportsAll(apiKey: String, page: number) {
    const url = environment.apiUrl + apiKey + '/tickets/all/page/' + page;
    return this.http.get(url, this.options);
  }
  getClaimsAll(apiKey: String, page: number) {
    const url = environment.apiUrl + apiKey + '/claims/all/page/' + page;
    return this.http.get(url, this.options);
  }

  getDriverDetails(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/billing-address/';
    return this.http.get(url, this.options);
  }
  getRecentShipments(apiKey: any) {
    const url = environment.apiUrl + apiKey + '/all';
    return this.http.get(url, apiKey);
  }

}
