import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { ToasterService } from '../../services/toaster.service';
import { ShipmentService } from '../../services/shipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ValidatorService } from '../../validators/password.validator';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.page.html',
  styleUrls: ['./update-password.page.scss'],
  providers: [ValidatorService],
})
export class UpdatePasswordPage implements OnInit {

  forgotPassForm: any = FormGroup;
  matching_passwords_group: any = FormGroup;
  private authUser: any;
  emailadd: any

  validation_messages = {
    'otp': [
      { type: 'required', message: 'OTP is required. Please enter OTP Code sent to your email address.' },
    ],
    'new_pass': [
      { type: 'required', message: 'New Password is required.' },
      { type: 'minlength', message: 'New Password minimum length is 6.' },
      { type: 'maxlength', message: 'New Password maximum length is 12.' },
      { type: 'pattern', message: 'Please enter a valid password.' }
    ],
    'confirm_pass': [
      { type: 'required', message: 'Please confirm Password.' },
      { type: 'minlength', message: 'Minimum length is 6.' },
      { type: 'maxlength', message: 'Maximum length is 12.' },
      { type: 'pattern', message: 'Please enter a valid password.' },
      { type: 'passwordMismatch', message: 'The passwords do not match' }
    ],
  }

  constructor(
    public formBuilder: FormBuilder,
    public loadingController: LoadingController,
    private toasterService: ToasterService,
    private shipmentService: ShipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private v: ValidatorService,
  ) { }

  ngOnInit() {
    this.setParamEmailID();
    // console.log(this.emailadd);

    //create form group
    this.forgotPassForm = this.formBuilder.group({
      otp: [
        '',
        Validators.required,

      ], new_pass: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,12}$')
        ],
      ],
      confirm_pass: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(12),
          Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,12}$')
        ],


      ]
    },
      {
        validators: [this.v.passwordMatch('new_pass', 'confirm_pass')]
      });
  }

  setParamEmailID() {
    this.activatedRoute.paramMap.subscribe(
      (data) => {
        this.emailadd = data.get('email');
      }
    );
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

  resetForms() {
    this.forgotPassForm.reset();
  }

  returnToLogin() {
    this.router.navigate(['/login']);
  }

  submitNewPassword() {
    this.forgotPassForm.markAllAsTouched();

    if (this.forgotPassForm.valid) {
      this.presentLoading();
      let postData = this.forgotPassForm.value;
      postData['email'] = this.emailadd;
      // console.log(postData);

      this.shipmentService.post('update-password/', postData).subscribe({
        next: (response: any) => {
          // console.log(response);
          this.loadingController.dismiss();
          if (response.status == '200') {
            this.resetForms();
            this.toasterService.presentToast(response.message, 'success', 3000);
            this.router.navigate(['/login/']);
          } else {
            this.resetForms();
            this.toasterService.presentToast('Request failed. ' + response.message, 'danger', 3000);
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

  //not implemented 
  matchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey];
      let passwordConfirmationInput = group.controls[passwordConfirmationKey];

      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
    }
  }
}
