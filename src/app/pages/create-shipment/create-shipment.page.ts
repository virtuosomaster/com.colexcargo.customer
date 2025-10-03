import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ToasterService } from 'src/app/services/toaster.service';
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
  selector: 'app-create-shipment',
  templateUrl: './create-shipment.page.html',
  styleUrls: ['./create-shipment.page.scss'],
})
export class CreateShipmentPage implements OnInit {

  @ViewChild(IonContent) content: any = IonContent;

  // Declare variables
  public authUser: any;
  public shipmentFields: any = [];
  public packageFields: any = [];
  public packageColumn: Number = 1;
  public prapareFlag: boolean = true;
  public errorMessage: String = '';
  public authUserFullname: String = '';

  myForm: FormGroup;
  dataForm: any;

  packageKeys: any;
  packageData: any = [];
  fieldList: any;
  loaded: boolean = false;

  dateFormat: any = 'YYYY-MM-DD';
  timeFormat: any = 'HH:mm:ss';
  datetimeFormat: any = 'YYYY-MM-DD HH:mm:ss';

  validation_messages: any = {};
  has_errors: any = {};

  constructor(
    private auth: AuthService,
    private shipmentService: ShipmentService,
    private formBuilder: FormBuilder,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
  ) {
    this.myForm = new FormGroup({});
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

  ngOnInit() {
    this.auth.userData$.subscribe((res: any) => {
      this.authUser = res;
      if(res) {
        if(!res.first_name && !res.last_name) {
          this.authUserFullname = res.username;
        } else {
          this.authUserFullname = `${res.first_name} ${res.last_name}`;
        }
      }
    });
  }

  ionViewWillEnter() {
    this.shipmentService.get(this.authUser.apiKey, '/settings').subscribe((response: any) => {
      if (response.app_date_format) {
        this.dateFormat = response.app_date_format;
      }
      if (response.app_time_format) {
        this.timeFormat = response.app_time_format;
      }
      if (response.app_datetime_format) {
        this.datetimeFormat = response.app_datetime_format;
      }
    }, err => {

    });

    this.shipmentService.get(this.authUser.apiKey, '/shipment/fields').subscribe((response: any) => {
      // Get the Fields

      // sort shipper info fields by weight
      if(response.shipper_info) {
        this.shipmentService.sortObjectsArrayByProperty(response.shipper_info, 'weight');
      }

      this.shipmentFields.push({ header: 'Shipper Information', data: this.exclude_fields(response.shipper_info) });

      // sort receiver info fields by weight
      if(response.receiver_info) {
        this.shipmentService.sortObjectsArrayByProperty(response.receiver_info, 'weight');
      }

      this.shipmentFields.push({ header: 'Receiver Information', data: this.exclude_fields(response.receiver_info) });

      // sort shipment info fields by weight
      if(response.shipment_info) {
        this.shipmentService.sortObjectsArrayByProperty(response.shipment_info, 'weight');
      }

      this.shipmentFields.push({ header: 'Shipment Information', data: this.exclude_fields(response.shipment_info) });
      this.packageFields = response['wpc-multiple-package'];
      // console.log(this.packageData);
      // console.log(this.shipmentFields);
      this.packageKeys = new Object;
      for (let field of this.packageFields) {
        this.packageKeys[field.metakey] = '';
      }
      this.packageColumn = this.packageFields.length + 1;

      this.fieldList = [...this.exclude_fields(response.shipper_info), ...this.exclude_fields(response.receiver_info), ...this.exclude_fields(response.shipment_info)];
      this.createControls(this.fieldList);

      this.prapareFlagDisable();
      this.loaded = true;

    }, err => {
      this.prapareFlagDisable();
      let message = "Network Issue. ";
      message += err.error.message;
      this.errorMessage = message;
    });
  }

  prapareFlagDisable() {
    this.prapareFlag = false;
  }
  prapareFlagEnable() {
    this.prapareFlag = true;
  }

  exclude_fields(fields: any) {
    return fields.filter((value: any) => {
      if (value.field_type == 'file' || value.field_type == 'url') {
        return false;
      }
      return value;
    });
  }

  createControls(controls: Array<FormControlObject>) {
    for (let control of controls) {
      let key = control.field_key;
      const newFormControl = new FormControl();
      if (control.required) {
        newFormControl.setValidators(Validators.required);
        this.validation_messages[key] = [{ type: 'required', message: 'This field is required.' }];
      }
      if (control.field_type === 'email') {
        newFormControl.setValidators(Validators.compose([
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]));

        this.validation_messages[key] = [{ type: 'pattern', message: 'Please make sure to use correct Pattern.' }];
      }
      this.myForm.addControl(control.field_key, newFormControl);
    }
  }
  // Reset Form Fields
  resetForms() {

    this.myForm.reset;

  }

  addPackage() {
    for (let [index, value] of this.packageFields.entries()) {
      if (value.required && !this.packageKeys[value.metakey]) {
        this.toasterService.presentToast('Package ' + value.label + ' is required.', 'danger', 2000);
        return;
      }
    }
    this.packageData.push(this.packageKeys);
    this.packageKeys = new Object;
  }
  deletePackage(packageKey: any) {
    this.packageData.splice(packageKey, 1);
  }

  submitCreateShipment() {
    let postData = this.myForm.value;
    let errors = this.errorChecks();
    postData['wpc-multiple-package'] = this.packageData;
    postData['wpcargo_status'] = 'Pending';


    // Do not allow to submit is Package is empty
    if (this.packageData.length == 0) {
      this.toasterService.presentToast('Package required', 'danger', 3000);
      return;
    }

    // console.log(Object.keys(errors).length);
    //check if there is validation error first
    if (Object.keys(errors).length > 0) {
      this.funcAppends();
      this.toasterService.presentToast('Fill out all required fields', 'danger', 5000);
      this.content.scrollToTop(2000);
    } else {
      this.presentLoading();

      this.shipmentService.createShipment(this.authUser.apiKey, postData).subscribe((res: any) => {
        this.loadingController.dismiss();
        if (res.status == "success") {
          this.resetForms();
          this.toasterService.presentToast('Shipment ' + res.shipment_number + ' successfully created.', 'success', 6000);
          setTimeout(() => {
            window.location.reload();
          }, 6000);
        } else {
          this.toasterService.presentToast('Request failed. ' + res.message, 'danger', 3000);
        }
      },
        (err: any) => {
          this.presentLoading();
          let message = "Error. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      );
    }


  }

  funcAppends() {
    let errors = this.errorChecks();

    for (let shipper of Object.keys(errors)) {
      let obj: any = shipper;
      // this.myForm.controls[obj].setValue('This field is required');
      this.has_errors[obj] = true;
    }

  }

  errorChecks() {
    let conts = this.myForm.controls;
    let fieldArray = this.fieldList;
    let errorList: any = {};

    for (let x of fieldArray) {
      let error: any = '';
      let key: any = x.field_key;
      error = conts[key]['errors'];

      if (error) {
        errorList[key] = error;
      }

    }
    return errorList;
  }
}
