import { Component, OnInit } from '@angular/core';
import { ShipmentService } from '../../services/shipment.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ToasterService } from '../../services/toaster.service';
import { StorageService } from 'src/app/services/storage.service';
import { Browser } from '@capacitor/browser';
import { AuthConstants } from 'src/app/config/auth-constants';


@Component({
  selector: 'app-claims',
  templateUrl: './claims.page.html',
  styleUrls: ['./claims.page.scss'],
})
export class ClaimsPage implements OnInit {

  //public status:string;
  public authUser: any;
  public claims: any = [];
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
    private storageService: StorageService,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: paramMap => {
        if (!paramMap.has('status')) {
          return;
        }
      }
    });

    this.storageService.get(AuthConstants.SUPPORTDESKACTIVE).then(res => {
      this.canSubmit = res.access.can_submit_support;
      this.canUpdate = res.access.can_update_support;
      this.canAccess = res.access.can_access_support;
      this.supportEnabled = res.status;
      console.log(res)
    });
  }
  ionViewWillEnter() {
    this.resetSearch();
    this.presentLoading();
    this.auth.userData$.subscribe({
      next: (res: any) => {
        if (res.apiKey && this.supportEnabled == true) {
          this.authUser = res;
          this.shipmentService.getClaimsAll(res.apiKey, this.page).subscribe({
            next: (response: any) => {
              this.loadingController.dismiss();
              this.claims = response;
              this.searchingFlag = false;
              // console.log(this.claims);

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
    this.shipmentService.userShipments$.subscribe((claimsData: any) => {
      if (claimsData.length) {
        this.claims = claimsData;
      }
    });
  }

  viewDetails(claimID: number) {
    this.router.navigate(['./home/claim-view/' + claimID])
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
      this.shipmentService.getClaimsAll(this.authUser.apiKey, this.page).subscribe({

        next: (response: any) => {
          if (!response) {
            event.target.complete();
            event.target.disabled = true;
            return;
          }
          for (const [key, value] of Object.entries(response)) {
            this.claims.push(value);
          }
          //  event.target.complete();
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
