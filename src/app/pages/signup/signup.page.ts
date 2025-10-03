import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { ToasterService } from '../../services/toaster.service';
import { ShipmentService } from '../../services/shipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ValidatorService } from '../../validators/password.validator';
import { EmailValidatorService } from '../../validators/email.validator';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  providers: [ValidatorService, EmailValidatorService]
})
export class SignupPage implements OnInit {

  signUpForm: any = FormGroup;
  matching_passwords_group: any = FormGroup;
  private authUser: any;
  authType: string = '';

  //Places
  allCountries: any = [];
  statesList: any = [];
  citiesList: any = [];
  fieldobj: any = [];
  allStates: any = [];
  allCities: any = [];

  //Validations
  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email address.' }
    ],
    'confirm_email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email address.' },
      { type: 'emailMismatch', message: 'The email  do not match' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password minimum length is 6.' },
      { type: 'maxlength', message: 'Password maximum length is 12.' },
      { type: 'pattern', message: 'Please enter a valid password.' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Please confirm Password.' },
      { type: 'minlength', message: 'Minimum length is 6.' },
      { type: 'maxlength', message: 'Maximum length is 12.' },
      { type: 'pattern', message: 'Please enter a valid password.' },
      { type: 'passwordMismatch', message: 'The passwords do not match' }
    ],
    'first_name': [
      { type: 'required', message: 'First Name is required.' },
    ],
    'last_name': [{ type: 'required', message: 'Last Name is required.' }],
    'billing_country': [{ type: 'required', message: 'Please select country from the list' }],
    'billing_address_1': [{ type: 'required', message: 'Please enter address ( eg. street name, house number, subdivision )' }],
    'billing_address_2': [{ type: 'required', message: 'Please enter address ( eg. street name, house number, subdivision )' }],
    'billing_state': [{ type: 'required', message: 'Please select state from the list.' }],
    'billing_city': [{ type: 'required', message: 'Please enter address ( eg. street name, house number, subdivision )' }],
    'billing_postcode': [{ type: 'required', message: 'Please enter address ( eg. street name, house number, subdivision )' }],
    'billing_phone': [{ type: 'required', message: 'Please enter address ( eg. street name, house number, subdivision )' }],
  };

  constructor(
    public formBuilder: FormBuilder,
    public loadingController: LoadingController,
    private toasterService: ToasterService,
    private shipmentService: ShipmentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private v: ValidatorService,
    private e: EmailValidatorService,
  ) { }

  ngOnInit() {
    //# fetch places list
    fetch('./assets/data/places.json').then(res => res.json())
      .then(json => {
        this.loadAllCountries(json);
      });

    //# declare form and its validation
    this.signUpForm = new FormGroup({
      'email': new FormControl('', Validators.compose([Validators.required, Validators.pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")])),
      'confirm_email': new FormControl('', Validators.compose([Validators.required, Validators.pattern("[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})")])),
      'password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,12}$')])),
      'confirm_password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,12}$')])),
      'billing_phone': new FormControl('', Validators.required),
      'billing_address_1': new FormControl('', Validators.required),
      'billing_address_2': new FormControl('', Validators.required),
      'billing_city': new FormControl('', Validators.required),
      'billing_postcode': new FormControl('', Validators.required),
      'billing_state': new FormControl('', Validators.required),
      'billing_country': new FormControl('', Validators.required),
      'first_name': new FormControl('', Validators.required),
      'last_name': new FormControl('', Validators.required),
    },
      {
        validators: [this.v.passwordMatch('password', 'confirm_password'), this.e.emailMatch('email', 'confirm_email')],
      }
    );
  }

  ionViewWillEnter() {
    this.authType = 'email';
    this.reset();
  }

  loadAllCountries(placeList: any) {
    for (const [key, value] of Object.entries(placeList)) {
      let country: any = value;
      this.allCountries.push({ 'name': country['name'] });
      this.statesList.push({ 'name': country['name'], 'states': country['states'] });
    }
  }

  runTimeChange(ev: any,) {
    let name = ev.target.id;
    this.fieldobj[ev.target.id] = { 'value': ev.target.value, 'name': name.replace('_', ' ') };
  }

  loadAllState(a: any) {

    let name = a.target.id;
    this.fieldobj[a.target.id] = { 'value': a.target.value, 'name': name.replace('_', ' ') };

    let country = a.detail.value;
    let states: any = [];

    if (country != 'Philippines') {
      for (const [key, value] of Object.entries(this.statesList)) {
        let list: any = value
        if (list['name'] == country && list['states'].length > 0) {
          for (const [keyName, valueName] of Object.entries(list['states'])) {
            let name: any = valueName;
            states.push({ 'name': name['name'], 'cities': name['cities'] });
          }
        } else if (list['name'] == country && list['states'].length == 0) {
          states.push({ 'name': country, 'cities': [] });
        }
      }
    } else {
      fetch('./assets/data/provinces.json').then(res => res.json()).then(json => {
        for (const [keyName, valueName] of Object.entries(json)) {
          let name: any = valueName;
          let cities = this.getAllPhilippineCities(name['state_name']);
          states.push({ 'name': name['state_name'], 'cities': cities });
        }
      });
    }
    this.allStates = states;
  }

  getAllPhilippineCities(state: any) {
    let cities: any = [];
    fetch('./assets/data/municipalities.json').then(res => res.json()).then(json => {
      for (const [keyName, valueName] of Object.entries(json)) {
        let name: any = valueName;
        if (name['province'] == state) {
          cities.push({ 'province': name['province'], 'name': name['name'] });
        }
      }
    });

    return cities;
  }

  loadAllCities(ace: any) {
    let name = ace.target.id;
    this.fieldobj[ace.target.id] = { 'value': ace.target.value, 'name': name.replace('_', ' ') };

    let state = ace.detail.value;
    let cities: any = [];

    for (const [key, value] of Object.entries(this.allStates)) {
      let cityList: any = value;
      if (cityList['name'] == state && cityList['cities'].length > 0) {
        for (const [keyCity, valueCity] of Object.entries(cityList['cities'])) {
          let name: any = valueCity;
          cities.push({ 'name': name['name'] });
        }
      } else if (cityList['name'] == state && cityList['cities'].length == 0) {
        cities.push({ 'name': state });
      }
    }
    this.allCities = cities;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

  reset() {
    this.signUpForm.reset();
  }

  returnToLogin() {
    this.router.navigate(['/login']);
  }

  Returnto(anytype: string) {
    this.authType = anytype;
  }

  Switchto(anytype: string) {
    //# Check for error first before switching template
    let errors = this.errorChecker(this.authType);

    if (errors > 0) {
      this.toasterService.presentToast('Request failed. Please check field errors', 'danger', 3000);
    } else {
      this.authType = anytype;
    }

    // console.log(this.fieldobj);
  }

  errorChecker(section: any) {
    let errors: any = [];
    let fields: any;
    let emailFields = ['email', 'confirm_email', 'password', 'confirm_password'];
    let billingFields = ['first_name', 'last_name', 'billing_address_1', 'billing_address_2', 'billing_city', 'billing_phone', 'billing_state', 'billing_postcode', 'billing_country'];

    if (section == 'email') {
      fields = emailFields;
      this.markTouchedEmails(emailFields);
      //# Loop through each email section fields
      for (let key of emailFields) {
        if (this.getErrors(key)) {
          errors.push(this.getErrors(key));
        }
      }
    } else if (section == 'personal') {
      fields = billingFields;
      this.markTouchedEmails(billingFields);

      for (let key of billingFields) {
        if (this.getErrors(key)) {
          errors.push(this.getErrors(key));
        }
      }
    }
    return errors.length;
  }

  getErrors(field: any) {
    let fg_controls = this.signUpForm.controls;
    let values: any;
    field = fg_controls[field]['errors'];

    if (field) {
      for (const [key, value] of Object.entries(field)) {
        values = ({ key: key, value: value });
      }
    }
    return values;
  }

  markTouchedEmails(fields: any) {
    for (let key of fields) {
      this.signUpForm.controls[key].markAsTouched();
    }
  }

  registerNewAccount() {
    let postData: any = {};
    postData['signup'] = this.signUpForm.value;

    // console.log(postData);
    this.presentLoading();
    this.shipmentService.signUp(postData).subscribe({
      next: (res: any) => {
        this.loadingController.dismiss();
        // console.log(res);
        if (res.status == 'success') {
          this.toasterService.presentToast('Succes! ' + res.message, 'success', 3000);
          this.router.navigate(['/login']);
        } else {
          this.toasterService.presentToast('Request failed. ' + res.message, 'danger', 3000);
        }
      }
    });
  }
}
