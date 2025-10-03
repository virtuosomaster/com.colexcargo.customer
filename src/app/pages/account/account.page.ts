import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/auth.service';

import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-accounts',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  userData: any = {}; // Initialize as null instead of an empty array
  driverFullData: any = null;
  loaded: boolean = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    public loadingController: LoadingController,
  ) { }

  ngOnInit() {
    // No need to fetch data here, as it will be fetched on every page entry
  }

  ionViewWillEnter() {
    this.fetchData();
  }

  async fetchData() {
    // Present the loading spinner
    await this.presentLoading();

    try {
      // 1. Fetch user data from storage.
      // 2. Assign the fetched data to the class property `this.userData`.
      this.userData = await this.storageService.get(AuthConstants.AUTH);

      if(!this.userData.first_name && !this.userData.last_name && this.userData.username) {
        this.userData['fullname'] = this.userData.username;
      } else {
        this.userData['fullname'] = this.userData.first_name + ' ' + this.userData.last_name;
      }

      // 3. Check if userData and apiKey exist.
      if (this.userData && this.userData.apiKey) {
        // 4. Call the service and subscribe to the result.
        this.shipmentService.getDriverDetails(this.userData.apiKey).subscribe({
          next: (result: any) => {
            // The remapping function will now use the correct `this.userData`
            if(this.userData.username) {
              result['username'] = this.userData.username;
            }
            this.driverFullData = this.remapDriverData(result);
            this.loaded = true;
          },
          error: (err) => {
            console.error('API call failed', err);
          },
          complete: () => {
            this.loadingController.dismiss();
          }
        });
      } else {
        console.error('User data or API key not found in storage.');
        this.loadingController.dismiss();
      }
    } catch (error) {
      console.error('Error fetching data from storage:', error);
      this.loadingController.dismiss();
    }
  }

  logout() {
    this.authService.logout();
  }

  remapDriverData(result: any) {
    let driver: any = {}; // Use an object literal
    driver['fullname'] = result['first_name'] + ' ' + result['last_name'];
    if(!result['first_name'] && !result['last_name']) {
      driver['fullname'] = result['username'];
    }
    driver['address'] = result['billing_address_1'] ? 
      `${result['billing_address_1']} ${result['billing_address_2']} ${result['billing_city']} ${result['billing_state']} ${result['billing_country']} ${result['billing_postcode']}` : '';
    driver['email'] = result['billing_email'] || this.userData.user_email;
    driver['phone'] = result['billing_phone'] || '';
    return driver;
  }

  async presentLoading() {
    // Only present the spinner if one isn't already visible
    const loader = await this.loadingController.getTop();
    if (!loader) {
      const loading = await this.loadingController.create({
        spinner: 'bubbles',
        message: 'Processing data please wait...'
      });
      await loading.present();
    }
  }
}