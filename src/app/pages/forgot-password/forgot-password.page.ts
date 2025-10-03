import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { LoadingController } from '@ionic/angular';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '../../services/toaster.service';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  //Variables declared
  public forgotPassForm: any = FormGroup;
  private authUser: any;

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email address.' }
    ],
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    public loadingController: LoadingController,
    public formBuilder: FormBuilder,
    private toasterService: ToasterService,
    public shipmentService: ShipmentService
  ) { }

  ngOnInit() {
    //# declare form and its validation
    this.forgotPassForm = new FormGroup({
      'email': new FormControl('', Validators.compose([Validators.required, Validators.pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")])),
    });
  }

  returnToLogin() {
    this.router.navigate(['/login']);
  }

  submitEmail() {
    this.forgotPassForm.markAllAsTouched();
    if (this.forgotPassForm.valid) {
      this.presentLoading();
      let postData = this.forgotPassForm.value;
      // console.log(postData);

      this.shipmentService.requestChangePass(postData).subscribe({
        next: (response: any) => {
          // console.log(response);
          this.loadingController.dismiss();
          if (response.status == 'success') {
            this.resetForms();
            this.toasterService.presentToast(response.message, 'success', 3000);
            this.router.navigate(['/update-password/', response['email']]);
          } else {
            this.toasterService.presentToast('Request failed. ' + response.message, 'danger', 3000);
            this.resetForms();
          }
        },
        error: (err: any) => {
          this.presentLoading();
          let message = "Error. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      });
    } else {
      this.toasterService.presentToast('Please provide all the required values!', 'danger', 3000);
    }
  }

  resetForms() {
    this.forgotPassForm.reset();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

}
