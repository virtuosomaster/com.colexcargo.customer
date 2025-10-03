import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthConstants } from '../../config/auth-constants';
import { LoadingController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '../../services/toaster.service';
import { HttpClient } from '@angular/common/http';
import { ShipmentService } from '../../services/shipment.service';

import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';
import { Location } from '@angular/common';
import { IonContent } from '@ionic/angular';


export interface FormControlObject {
  label: string,
  field_key: string,
  field_type: string,
  required: string,
  field_data: any,
  value: any
}
@Component({
  selector: 'app-add-claim',
  templateUrl: './add-claim.page.html',
  styleUrls: ['./add-claim.page.scss'],
})
export class AddClaimPage implements OnInit {

  @ViewChild(IonContent) content: any = IonContent;

  public authUser: any;
  packageData: any = [];
  ticket_categories: any;
  ticket_warehouse: any;
  claim_type: any;
  addTicketForm: FormGroup;
  public shipmentFields: any = [];
  public packageFields: any = [];
  public packageColumn: Number;
  public prapareFlag: boolean = true;
  public errorMessage: String = '';
  public claimTypes: any = [];
  public warehouses: any = [];
  fieldList: any;
  public files: PickedFile[] = [];
  canUpload: any;

  validation_messages = {
    'claim_date': [{ type: 'required', message: 'Date is required. Please select date.' }],
    'claim_type': [{ type: 'required', message: 'Please select claim type from the list.' },],
    'ticket_warehouse': [{ type: 'required', message: 'Please select warehouse from the list.' },],
    'claims_item_value': [{ type: 'required', message: 'Item value is required.' }],
    'claims_invoice': [{ type: 'required', message: 'Invoice number is required.' }],
    'claims_tracking': [{ type: 'required', message: 'Parcel ID Number is required.' }],
    'claims_description': [{ type: 'required', message: 'Please enter message or description.' }],
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public loadingController: LoadingController,
    private toasterService: ToasterService,
    private shipmentService: ShipmentService,
    private _location: Location,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.auth.userData$.subscribe((res: any) => {
      this.authUser = res;
    });

    this.storageService.get(AuthConstants.SUPPORTDESKACTIVE).then(res => {
      this.canUpload = res.access.enable_file_upload;
    });

    this.addTicketForm = new FormGroup({
      ticket_country: new FormControl(''),
      claim_type: new FormControl('', Validators.required),
      ticket_warehouse: new FormControl('', Validators.required),
      claim_date: new FormControl('', Validators.required),
      claims_item_value: new FormControl('', Validators.required),
      claims_invoice: new FormControl('', Validators.required),
      claims_tracking: new FormControl('', Validators.required),
      claims_description: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    this.shipmentService.get(this.authUser.apiKey, '/claim/warehouses').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.warehouses = data.data;
      }
    });

    this.shipmentService.get(this.authUser.apiKey, '/claim/settings').subscribe({
      next: (data: any) => {
        this.claimTypes = this.formatClaimTypes(data.data.categories);
        this.prapareFlagDisable();
      }
    });

  }

  formatClaimTypes(data: any) {
    let keys: any = [];
    for (let key of data) {
      let _key = (key.toLowerCase()).replace(' ', '_');
      keys.push({ 'value': _key, 'name': key });

    }
    return keys;
  }
  resetForms() {
    this.addTicketForm.reset();
  }

  prapareFlagDisable() {
    this.prapareFlag = false;
  }
  prapareFlagEnable() {
    this.prapareFlag = true;
  }

  warehouseChange(e: any) {
    // console.log('ionChange fired with value: ' + e.detail.value);
    this.ticket_warehouse = e.detail.value;
  }

  // categoryChange(e:any) {
  //   console.log('ionChange fired with value: ' + e.detail.value);
  //   this.ticket_warehouse= e.detail.value;
  // }

  typeClaimChange(e: any) {
    // console.log('ionChange fired with value: ' + e.detail.value);
    this.claim_type = e.detail.value;
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

  submitaddTicket() {
    const checked = this.errorChecker();

    let postData = this.addTicketForm.value;
    // postData['ticket_country'] = 'Philippines';
    // postData['ticket_warehouse'] = this.ticket_warehouse;
    // postData['claim_type'] = this.claim_type;
    postData['media'] = this.files;

    // console.log(checked);
    // console.log(postData);
    if (checked.length > 0) {
      this.toasterService.presentToast('Request failed. Please check field errors', 'danger', 3000);
      this.content.scrollToTop(2000);
    } else {
      this.presentLoading();
      this.shipmentService.addClaim(this.authUser.apiKey, postData).subscribe({

        next: (res: any) => {
          this.loadingController.dismiss();
          if (res.status == "success") {
            this.resetForms();
            this.toasterService.presentToast('Claim ' + res.claim_number + ' successfully created.', 'success', 6000);
            setTimeout(() => {
              this.goToShipments();
            }, 3000);
          } else {
            this.toasterService.presentToast('Request failed. ' + res.message, 'danger', 3000);
          }
        },
        error: (err: any) => {
          this.presentLoading();
          let message = "Error. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      });
    }
  }

  errorChecker() {
    this.addTicketForm.markAllAsTouched();

    let errors: any = [];
    let controls = this.addTicketForm.controls;

    for (const [key, value] of Object.entries(controls)) {
      let val: any = value;
      if (val['errors']) {
        errors.push(val['errors']);
        // console.log(key, val['errors']);
      }
    }
    return errors;
  }

  public async pickFile(): Promise<void> {
    const types = this.addTicketForm.get('types')?.value || [];
    const limit = 0;
    const readData = true;
    const { files } = await FilePicker.pickFiles({ types, limit, readData });
    this.files = files;
    // console.log(this.files);
    //path	string	The path of the file. Only available on Android and iOS.
  }


  goToShipments() {
    this._location.back();
  }
}


