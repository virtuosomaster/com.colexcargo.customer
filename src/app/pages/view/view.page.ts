import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  public trackShipment!: FormGroup;
  public search: string = '';
  public searchedList: any;
  public authUser: any;
  public trackedShipment: any = null;
  public shipmentHistory: any = [];
  public shipmentAllData: any = [];
  public dynamicBooleans: Record<string, any> = {};
  public apiKey: string = '';
  public trackResult: boolean = false;
  public showDetail: boolean = false;
  public showDetailIcon: string = 'caret-down-circle-outline';

  public shipperFields: any[] = [];
  public receiverFields: any[] = [];

  public stateFlag = false;
  public loadFlag = false;
  public searchingFlag = false;
  public noResultFlag = false;
  public isSettingsSetup = false;
  public errorMessage: any = false;

  public validation_messages = {
    shipment_number: [{ type: 'required', message: 'Shipment number is required.' }],
  };

  constructor(
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private _location: Location,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.trackShipment = new FormGroup({
      shipment_number: new FormControl('', Validators.required),
    });

    this.storageService.get(AuthConstants.AUTH).then((res) => {
      this.authUser = res;
      this.apiKey = res.apiKey || '';
    });

    this.loadStoredFields(AuthConstants.SHIPPER_FIELDS, 'shipperFields');
    this.loadStoredFields(AuthConstants.RECEIVER_FIELDS, 'receiverFields');
  }

  private async loadStoredFields(key: string, assignTo: 'shipperFields' | 'receiverFields') {
    const fields = await this.storageService.get(key);
    if (fields) {
      this[assignTo] = Object.entries(fields).map(([key, value]) => ({ key, value }));
    }
  }

  setBooleanField(key: string, value: any) {
    this.dynamicBooleans[key] = value;
  }

  getBooleanField(key: string) {
    return this.dynamicBooleans[key];
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing request...',
    });
    await loading.present();
    return loading;
  }

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

  async searchShipments() {
    const loading = await this.presentLoading();
    this.searchingFlag = true;

    const searchValue = this.search.trim();
    this.shipmentService.get(this.apiKey, `/shipment/search/${searchValue}`).subscribe({
      next: (response: any) => {
        this.errorMessage = !response ? 'No result Found' : '';
        this.searchedList = response;
      },
      error: (err) => {
        this.errorMessage = `Network Issue. ${err.error?.message || ''}`;
      },
      complete: () => {
        this.searchingFlag = false;
        loading.dismiss();
      },
    });
  }

  async submitTrackForm() {
    this.trackShipment.markAllAsTouched();
    const errors = this.trackShipment.controls['shipment_number'].errors;

    if (errors) {
      this.toasterService.presentToast('Request failed. Please fill out required fields.', 'danger', 3000);
      return;
    }

    const loading = await this.presentLoading();
    this.shipmentAllData = []; // Clear before new tracking
    this.trackResult = false;

    const trackingNumber = this.trackShipment.value.shipment_number;

    this.shipmentService.get(this.apiKey, `/shipment/track/${trackingNumber}`).subscribe({
      next: (res: any) => {
        if (!res) {
          this.toasterService.presentToast('Invalid tracking number.', 'danger');
          return;
        }

        this.trackedShipment = res;
        this.shipmentHistory = res.shipment_history || [];

        this.shipmentService.get(this.apiKey, '/shipment/fields').subscribe({
          next: (response: any) => {
            if (response) {
              let indexCount = 0;
              for (const [sectionKey, sectionFields] of Object.entries(response)) {
                if (sectionKey && Array.isArray(sectionFields) && sectionFields.length > 0 && sectionFields[0].field_key && !AuthConstants.CUSTOM_SECTIONS_TO_HIDE.includes(sectionKey)) {
                  this.shipmentService.sortObjectsArrayByProperty(sectionFields, 'weight');

                  const sectionData = sectionFields.map((field: any) => ({
                    key: field.field_key,
                    value: this.trackedShipment[field.field_key] || '',
                    label: field.label || '',
                  }));

                  this.shipmentAllData.push({
                    sectionLabel: this.toTitleCase(sectionKey),
                    sectionKey,
                    sectionView: false,
                    sectionIndex: indexCount++,
                    sectionData,
                  });

                  this.setBooleanField(sectionKey, false);
                }
              }
            }
          },
          error: (err) => {
            this.errorMessage = `Network Issue. ${err.error?.message || ''}`;
          },
          complete: () => {
            this.trackResult = true;
            console.log(this.shipmentAllData);
          },
        });
      },
      error: () => {
        this.toasterService.presentToast('Failed to track shipment.', 'danger');
      },
      complete: () => {
        loading.dismiss();
      },
    });
  }

  toTitleCase(input: string): string {
    return input
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  showDetails() {
    this.showDetail = !this.showDetail;
    this.showDetailIcon =
      this.showDetailIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  reload() {
    window.location.reload();
  }

  handleClick(event: Event) {
    const target = event.currentTarget as HTMLElement;
    let sectionIndex:any = target.getAttribute('data-sectionIndex');
    if(!this.shipmentAllData[sectionIndex].sectionView) {
      this.shipmentAllData[sectionIndex].sectionView = true;
    } else {
      this.shipmentAllData[sectionIndex].sectionView = false;
    }
  }
}
