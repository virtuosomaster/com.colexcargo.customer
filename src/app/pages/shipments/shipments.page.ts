import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ToasterService } from 'src/app/services/toaster.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { Location } from '@angular/common';

import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-shipments',
  templateUrl: './shipments.page.html',
  styleUrls: ['./shipments.page.scss'],
})
export class ShipmentsPage implements OnInit, OnDestroy {

  public status: any = '';
  public authUser: any;
  public shipments: any;
  public page: number = 1;
  public search: string = '';
  public searchedList: any;

  stateFlag = false;
  noResultFlag = false;
  searchingFlag = true;
  errorMessage: any = false;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    private storageService: StorageService,
    public loadingController: LoadingController,
    private _location: Location
  ) { }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 6000
    });
    await loading.present();
  }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.status = data.get('status');
      });
  }

  ionViewWillEnter() {
    this.resetSearch();

    this.auth.userData$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((res: any) => {
          if (res.apiKey) {
            this.authUser = res;
            this.page = 1;  // reset page for new fetch

            return forkJoin({
              shipments: this.shipmentService.pageByStatus(res.apiKey, this.page, this.status),
              podSettings: this.shipmentService.getPODSettings(res.apiKey)
            });
          }
          return [];
        })
      )
      .subscribe({
        next: ({ shipments, podSettings }) => {
          this.shipments = shipments;
          this.searchingFlag = false;

          if (podSettings) {
            const { unrequired = [] } = podSettings;
            this.storageService.set(AuthConstants.STATUS, podSettings.status);
            this.storageService.set(AuthConstants.SHIPPER_FIELDS, podSettings.fields.shipper);
            this.storageService.set(AuthConstants.RECEIVER_FIELDS, podSettings.fields.receiver);
          }
        },
        error: (err) => {
          let message = 'Network Issue. ' + (err.error?.message || err.message);
          this.toasterService.presentToast(message, 'danger', 6000);
          this.searchingFlag = false;
        }
      });
  }

  setShipments() {
    this.shipmentService.userShipments$
      .pipe(takeUntil(this.destroy$))
      .subscribe((shipmentData: any) => {
        if (shipmentData.length) {
          this.shipments = shipmentData;
        }
      });
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }

  // Search methods
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
    if (!this.authUser || !this.authUser.apiKey) {
      this.errorMessage = 'User not authenticated.';
      return;
    }
    this.searchingFlag = true;
    this.shipmentService.get(this.authUser.apiKey, '/shipment/search/' + this.search.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.errorMessage = !response || response.length === 0 ? 'No result Found' : '';
        this.searchedList = response;
        this.searchingFlag = false;
      }, (err: any) => {
        let message = "Network Issue. " + (err.error?.message || err.message);
        this.errorMessage = message;
        this.searchingFlag = false;
      });
  }

  // Infinite Scroll
  loadData(event: any) {
    this.page++;
    setTimeout(() => {
      this.shipmentService.pageByStatus(this.authUser.apiKey, this.page, this.status)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response: any) => {
          if (!response || Object.keys(response).length === 0) {
            event.target.complete();
            event.target.disabled = true;
            return;
          }
          for (const [key, value] of Object.entries(response)) {
            this.shipments.push(value);
          }
          event.target.complete();
        }, err => {
          let message = "Network Issue. " + (err.error?.message || err.message);
          this.toasterService.presentToast(message, 'danger', 6000);
          event.target.complete();
        });
    }, 500);
  }

  goToShipments() {
    this.router.navigate(['./home/dashboard/']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
