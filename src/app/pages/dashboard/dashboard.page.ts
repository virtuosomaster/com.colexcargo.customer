import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  public authUser: any;
  public authUserFullname: any;
  public shipments: any;
  public page: number = 1;
  public search: string = '';
  public searchedList: any;

  searchingFlag = true;
  errorMessage: any = false;
  latestShipment: any = [];
  loaded = false;
  loading: HTMLIonLoadingElement;

  constructor(
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private storageService: StorageService
  ) { }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Please wait...',
      duration: 6000
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  // Use ionViewWillEnter for data fetching
  async ionViewWillEnter() {
    this.resetSearch();
    await this.presentLoading();

    const storedUser = await this.storageService.get(AuthConstants.AUTH);
    if (storedUser && storedUser.apiKey) {
      this.authUser = storedUser;
      if(this.authUser.apiKey) {
        setTimeout(() => {
          console.log(storedUser);
          this.authUserFullname = storedUser.first_name + ' ' + storedUser.last_name || storedUser.username;
          if(!storedUser.first_name && !storedUser.last_name) {
            this.authUserFullname = storedUser.username;
          }
          this.fetchData();
        }, 500);
      }
    } else {
      this.dismissLoading();
      this.toasterService.presentToast("Authentication failed. Please log in.", 'danger', 6000);
      this.router.navigate(['/login']); // Redirect to login
    }
  }

  async fetchData() {
    this.shipmentService.get(this.authUser.apiKey, '/support/plugin/checker').subscribe({
      next: (access: any) => {
        this.storageService.set(AuthConstants.SUPPORTDESKACTIVE, access);
      }
    });

    this.shipmentService.getShipmentsAllStatus(this.authUser.apiKey).subscribe({
      next: (response: any) => {
        console.log(response);
        this.shipments = response;
        this.searchingFlag = false;
      },
      error: err => {
        let message = "Network Issue. ";
        message += err.error.message;
        this.toasterService.presentToast(message, 'danger', 6000);
        this.dismissLoading();
      }
    });

    this.shipmentService.getRecentShipments(this.authUser.apiKey).subscribe({
      next: (response: any) => {
        function getLastElement<Type>(array: Type[]): Type | undefined {
          if (array.length === 0) return undefined;
          return array[array.length - 1];
        }
        this.latestShipment = getLastElement(response);
        this.loaded = true;
        this.dismissLoading();
      },
      error: err => {
        this.dismissLoading();
      }
    });
  }

  // Remaining methods (viewShipment, viewDetails, etc.)
  viewShipment(status: any) {
    this.router.navigate(['./home/shipments/' + status]);
  }
  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }
  createNewShipment() {
    this.router.navigate(['./home/create']);
  }
  onSearchShipment() {
    this.searchShipments();
  }
  onInput() {
    this.onClear();
  }
  onClear() {
    this.searchedList = null;
    this.searchingFlag = false;
    this.errorMessage = false;
  }
  resetSearch() {
    this.searchedList = null;
    this.errorMessage = false;
    this.search = '';
  }
  searchShipments() {
    this.searchingFlag = true;
    this.shipmentService.get(this.authUser.apiKey, '/shipment/search/' + this.search.trim()).subscribe({
      next: (response: any) => {
        this.errorMessage = !response ? 'No result Found' : '';
        this.searchedList = response;
        this.searchingFlag = false;
      },
      error: (err: any) => {
        let message = "Network Issue. ";
        message += err.error.message;
        this.errorMessage = message;
      }
    });
  }
  openSite() {
    Browser.open({ url: 'https://colexcargo.com/' });
  }
  ngOnInit() {
    // Keep ngOnInit clean, as ionViewWillEnter is now handling the logic.
  }
}