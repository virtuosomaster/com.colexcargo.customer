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
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.page.html',
  styleUrls: ['./add-ticket.page.scss'],
})
export class AddTicketPage implements OnInit {

  @ViewChild(IonContent) content: any = IonContent;

  public authUser: any;
  packageData: any = [];
  ticket_categories: any;
  ticket_warehouse: any;
  addTicketForm: FormGroup;
  public shipmentFields: any = [];
  public packageFields: any = [];
  public packageColumn: Number;
  public prapareFlag: boolean = true;
  public errorMessage: String = '';
  fieldList: any;
  public files: PickedFile[] = [];
  public claimTypes: any = [];
  public warehouses: any = [];
  canUpload: any;

  validation_messages = {
    'ticket_comment': [{ type: 'required', message: 'Message is required. Please state full details of your concern.' }],
    'ticket_country': [{ type: 'required', message: 'Country is required.' },],
    'ticket_subject': [{ type: 'required', message: 'Subject is required. Please ass a subject related to your concern.' }],
    'ticket_tracking': [{ type: 'required', message: 'Tracking Number is required. This will help us trace your concerns.' }],
    'ticket_categories': [{ type: 'required', message: 'Please select claim type from the list.' },],
    // 'ticket_warehouse': [{ type: 'required', message: 'Please select warehouse from the list.' },],
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
      ticket_country: new FormControl('', Validators.required),
      ticket_categories: new FormControl('', Validators.required),
      ticket_warehouse: new FormControl(''),
      ticket_subject: new FormControl('', Validators.required),
      ticket_tracking: new FormControl('', Validators.required),
      ticket_comment: new FormControl('', Validators.required),

    });
  }

  ionViewWillEnter() {
    this.shipmentService.get(this.authUser.apiKey, '/claim/warehouses').subscribe({
      next: (data: any) => {
        this.warehouses = data.data;
      }
    });

    this.shipmentService.get(this.authUser.apiKey, '/support/settings').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.claimTypes = this.formatClaimTypes(data.data.categories);
        this.prapareFlagDisable();
      }
    });

  }

  prapareFlagDisable() {
    this.prapareFlag = false;
  }
  prapareFlagEnable() {
    this.prapareFlag = true;
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
    postData['media'] = this.files;

    // console.log(checked)
    //checkers for required
    if (checked.length > 0) {
      this.toasterService.presentToast('Request failed. Please fill in required fields', 'danger', 3000);
      this.content.scrollToTop(2000);
    } else {
      this.presentLoading();
      this.shipmentService.addTicket(this.authUser.apiKey, postData).subscribe({
        next: (res: any) => {
          this.loadingController.dismiss();
          // console.log(res);
          if (res.status == "success") {
            this.resetForms();
            this.toasterService.presentToast('Ticket ' + res.ticket_number + ' successfully created.', 'success', 6000);

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


