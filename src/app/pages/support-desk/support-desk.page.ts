import { Component, OnInit } from '@angular/core';
import { ShipmentService } from '../../services/shipment.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ToasterService } from '../../services/toaster.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { StorageService } from 'src/app/services/storage.service';
import { Browser } from '@capacitor/browser';


@Component({
  selector: 'app-support-desk',
  templateUrl: './support-desk.page.html',
  styleUrls: ['./support-desk.page.scss'],
})
export class SupportDeskPage implements OnInit {

  //public status:string;
  public authUser: any;
  public tickets: any = [];
  public page: number = 1;
  public search: string = '';
  public searchedList: any;

  stateFlag = false;
  noResultFlag = false;
  searchingFlag = true;
  errorMessage: any = false;
  canSubmit: any;
  canUpdate: any;
  canAccess: any;
  supportEnabled: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.storageService.get(AuthConstants.SUPPORTDESKACTIVE).then(res => {
      this.canSubmit = res.access.can_submit_support;
      this.canUpdate = res.access.can_update_support;
      this.canAccess = res.access.can_access_support;
      this.supportEnabled = res.status;
      console.log(res)
    });

    this.activatedRoute.paramMap.subscribe({
      next: paramMap => {
        if (!paramMap.has('status')) {
          return;
        }
        //  this.status = paramMap.get( 'status' );
      }
    });
  }

  ionViewWillEnter() {
    this.presentLoading();
    this.resetSearch();
    this.auth.userData$.subscribe({
      next: (res: any) => {
        if (res.apiKey && this.supportEnabled == true) {
          this.authUser = res;
          this.shipmentService.getSupportsAll(res.apiKey, this.page).subscribe({
            next: (response: any) => {
              this.loadingController.dismiss();
              this.tickets = response;
              this.searchingFlag = false;
              // console.log(this.tickets);
            },

            error: err => {
              let message = "Network Issue. "
              message += err.error.message;
              this.toasterService.presentToast(message, 'danger', 6000);
            }

          });
        }
      }
    });
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 3000
    });
    await loading.present();
  }

  setShipments() {
    this.shipmentService.userShipments$.subscribe((shipmentData: any) => {
      if (shipmentData.length) {
        this.tickets = shipmentData;
      }
    });
  }

  viewDetails(ticketID: number) {
    this.router.navigate(['./home/support-view/' + ticketID])
  }

  // Search method
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
    this.shipmentService.get(this.authUser.apiKey, '/support/search/' + this.search.trim()).subscribe((response: any) => {
      this.errorMessage = !response ? 'No result Found' : '';
      this.searchedList = response;
      this.searchingFlag = false;
      // console.log(this.searchedList)
    }, (err: any) => {
      let message = "Network Issue. "
      message += err.error.message;
      this.errorMessage = message;
    }
    );
  }

  // Infinite Scroll
  loadData(event: any) {
    this.page++;
    setTimeout(() => {
      this.shipmentService.getSupportsAll(this.authUser.apiKey, this.page).subscribe({

        next: (response: any) => {
          if (response == null) {
            event.target.complete();
            event.target.disabled = true;
            return;
          }
          for (const [key, value] of Object.entries(response)) {
            this.tickets.push(value);
          }
          event.target.complete();
        },
        error: err => {
          let message = "Network Issue. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      });
    }, 500);
  }

  openCapacitorSite = async (url: any) => {
    await Browser.open({ url: url });
  }
}
