import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Browser } from '@capacitor/browser';
import { Location } from '@angular/common';

import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-shipment',
  templateUrl: './shipment.page.html',
  styleUrls: ['./shipment.page.scss'],
})
export class ShipmentPage implements OnInit, OnDestroy {
  public search: string = '';
  public searchedList: any;
  public authUser: any;

  // Search variables
  stateFlag = false;
  loadFlag = false;
  searchingFlag = false;
  noResultFlag = false;
  isSettingsSetup = false;
  errorMessage: any = false;

  statusList: any = [];
  apiKey: string = '';
  shipmentId: any;
  errMessage: string = '';
  shipperFields: any = [];
  receiverFields: any = [];
  public shipmentData: any = [];
  public shipmentFullData: any = [];
  public shipmentAllData: any = [];
  public dynamicBooleans: Record<string, any> = {};

  viewShipper: boolean = true;
  viewReceiver: boolean = true;
  viewPackage: boolean = false;
  viewHistory: boolean = false;
  viewImages: boolean = false;
  viewSignature: boolean = false;
  viewShipperIcon: string = 'caret-up-circle-outline';
  viewReceiverIcon: string = 'caret-up-circle-outline';
  viewPackageIcon: string = 'caret-down-circle-outline';
  viewHistoryIcon: string = 'caret-down-circle-outline';
  viewImagesIcon: string = 'caret-down-circle-outline';
  viewSignatureIcon: string = 'caret-down-circle-outline';

  public hasSignature = false;
  public hasCaptured = false;
  public onLoad = false;

  private destroy$ = new Subject<void>();

  constructor(
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private router: Router,
    private _location: Location
  ) {}

  setBooleanField(key: string, value: any) {
    this.dynamicBooleans[key] = value;
  }

  getBooleanField(key: string) {
    return this.dynamicBooleans[key];
  }

  async presentLoading(message = 'Processing request...') {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message,
    });
    await loading.present();
    return loading;
  }

  ngOnInit() {
    // Load static data from storage once (can be improved to reload if necessary)
    this.storageService.get(AuthConstants.STATUS).then((status) => {
      this.statusList = status;
    });

    this.storageService.get(AuthConstants.AUTH).then((res) => {
      this.apiKey = res?.apiKey || '';
    });

    this.storageService.get(AuthConstants.SHIPPER_FIELDS).then((res) => {
      const sData = [];
      for (const [key, value] of Object.entries(res || {})) {
        sData.push({ key, value });
      }
      this.shipperFields = sData;
    });

    this.storageService.get(AuthConstants.RECEIVER_FIELDS).then((res) => {
      const sData = [];
      for (const [key, value] of Object.entries(res || {})) {
        sData.push({ key, value });
      }
      this.receiverFields = sData;
    });

    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((paramMap) => {
        this.shipmentId = paramMap.get('shipmentID');
      });
  }

  async ionViewWillEnter() {

    const loading = await this.presentLoading();
    
    if(!this.apiKey) {
      this.storageService.get(AuthConstants.AUTH).then((res) => {
        this.apiKey = res?.apiKey || '';
      });
    }

    if(!this.shipmentId) {
      this.activatedRoute.paramMap
        .pipe(takeUntil(this.destroy$))
        .subscribe((paramMap) => {
          this.shipmentId = paramMap.get('shipmentID');
        });
    }

    if (!this.apiKey || !this.shipmentId) {
      this.toasterService.presentToast('Invalid shipment or user data', 'danger', 6000);
      return;
    }

    // Fetch shipment data and fields in parallel after apiKey & shipmentId are available
    forkJoin({
      shipment: this.shipmentService.get(this.apiKey, '/shipment/id/' + this.shipmentId),
      fields: this.shipmentService.get(this.apiKey, '/shipment/fields'),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ shipment, fields }) => {
          if (shipment?.status === 'error') {
            this.toasterService.presentToast(shipment.message, 'danger', 6000);
            loading.dismiss();
            return;
          }

          this.onLoad = true;

          const capturedImages = shipment.pod_images || [];
          const signature = shipment.sign_image || '';

          this.hasCaptured = capturedImages.length > 0;
          this.hasSignature = !!signature;

          // Compose shipment data with custom fields
          const resData: any = {
            ID: shipment.ID,
            shipment_number: shipment.post_title,
            wpcargo_status: shipment.status,
            shipment_packages: shipment.shipment_packages,
            pod_images: capturedImages,
            pod_signature: signature,
            history: (shipment.shipment_history || []).slice().reverse(),
            details: this.setShipmentDetails(shipment),
          };

          for (const shipper of this.shipperFields) {
            resData[shipper.key] = shipment[shipper.key];
          }
          for (const receiver of this.receiverFields) {
            resData[receiver.key] = shipment[receiver.key];
          }

          this.shipmentData = { ...resData };
          this.shipmentFullData = shipment;

          // Process fields for display sections
          this.shipmentAllData = [];
          let indexCount = 0;

          for (const [key, value] of Object.entries(fields || {})) {
            if (
              key &&
              Array.isArray(value) &&
              value.length > 0 &&
              value[0].field_key &&
              !AuthConstants.CUSTOM_SECTIONS_TO_HIDE.includes(key)
            ) {
              this.shipmentService.sortObjectsArrayByProperty(value, 'weight');

              const sectionData = value.map((field: any) => ({
                key: field.field_key,
                value: this.shipmentFullData[field.field_key] || '',
                label: field.label || '',
              }));

              this.shipmentAllData.push({
                sectionLabel: this.toTitleCase(key),
                sectionKey: key,
                sectionView: false,
                sectionIndex: indexCount++,
                sectionData,
              });

              this.setBooleanField(key, false);
            }
          }

          loading.dismiss();
        },
        error: (err) => {
          const message = `Network Issue. ${err.error?.message || err.message || ''}`;
          this.toasterService.presentToast(message, 'danger', 6000);
          loading.dismiss();
        },
      });
  }

  setShipmentDetails(res: any) {
    const details: any = {};

    if (res.wpcargo_origin_field) {
      details.origin = res.wpcargo_origin_field;
    }

    if (res.wpcargo_destination) {
      details.destination = res.wpcargo_destination;
    }

    if (res.wpcargo_pickup_date_picker) {
      details.departure = res.wpcargo_pickup_date_picker;
    }

    if (res.wpcargo_expected_delivery_date_picker) {
      details.arrival = res.wpcargo_expected_delivery_date_picker;
    }

    return details;
  }

  toTitleCase(input: string): string {
    return input
      .split(/[-_]/) // split on hyphens or underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  returnList() {
    this.router.navigate(['/home/delivered']);
  }

  // Toggle section views
  hideHistory() {
    this.viewHistory = !this.viewHistory;
    this.viewHistoryIcon =
      this.viewHistoryIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideShipper() {
    this.viewShipper = !this.viewShipper;
    this.viewShipperIcon =
      this.viewShipperIcon === 'caret-up-circle-outline' ? 'caret-down-circle-outline' : 'caret-up-circle-outline';
  }

  hideReceiver() {
    this.viewReceiver = !this.viewReceiver;
    this.viewReceiverIcon =
      this.viewReceiverIcon === 'caret-up-circle-outline' ? 'caret-down-circle-outline' : 'caret-up-circle-outline';
  }

  hidePackage() {
    this.viewPackage = !this.viewPackage;
    this.viewPackageIcon =
      this.viewPackageIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideImages() {
    this.viewImages = !this.viewImages;
    this.viewImagesIcon =
      this.viewImagesIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideSignature() {
    this.viewSignature = !this.viewSignature;
    this.viewSignatureIcon =
      this.viewSignatureIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  zoomPhoto = async (url: any) => {
    await Browser.open({ url: url });
  };

  goToShipments() {
    this._location.back();
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
    if (!this.authUser?.apiKey) {
      this.errorMessage = 'User not authenticated.';
      return;
    }

    this.presentLoading('Searching...').then((loading) => {
      this.searchingFlag = true;
      this.shipmentService.get(this.authUser.apiKey, '/shipment/search/' + this.search.trim()).subscribe(
        (response: any) => {
          this.errorMessage = !response || response.length === 0 ? 'No result Found' : '';
          this.searchedList = response;
          this.searchingFlag = false;
          loading.dismiss();
        },
        (err: any) => {
          let message = 'Network Issue. ';
          message += err.error?.message || err.message || '';
          this.errorMessage = message;
          loading.dismiss();
        }
      );
    });
  }

  handleClick(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const sectionIndex = target.getAttribute('data-sectionIndex');
    if (sectionIndex !== null && this.shipmentAllData[+sectionIndex]) {
      this.shipmentAllData[+sectionIndex].sectionView = !this.shipmentAllData[+sectionIndex].sectionView;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
