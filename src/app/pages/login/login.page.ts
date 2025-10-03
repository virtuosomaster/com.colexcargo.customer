import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { LoadingController } from '@ionic/angular';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  postData = {
    username: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    public loadingController: LoadingController,
    private toasterService: ToasterService
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
  }

  validateInputs() {
    let username = this.postData.username.trim();
    let password = this.postData.password.trim();
    return (
      this.postData.username &&
      this.postData.password &&
      username.length > 0 &&
      password.length > 0
    );
  }
  arrayContainsFractionOfString(arr: string[], fraction: string): boolean {
    return arr.some(element => element.includes(fraction));
  }
  loginAction() {
    if (this.validateInputs()) {
      this.presentLoading();
      this.authService.login(this.postData).subscribe(
        (res: any) => {
          console.log(res);
          this.loadingController.dismiss();
          // Check if response is NOT an ERROR
          if (res.type != 'error') {
            // Check is User is a Client
            const isClient = this.arrayContainsFractionOfString(res.user.role_slugs, 'wpcargo_client');
            if (!isClient) {
              this.errorMessage = 'Login failed. Not enough permission';
              this.toasterService.presentToast(this.errorMessage, 'danger');
              return;
            }
            const userData = res.user;
            userData["apiKey"] = res.api;
            // Storing the User data.
            this.storageService
              .set(AuthConstants.AUTH, userData)
              .then(res => {
                this.router.navigate(['home']);
              });
          } else {
            this.errorMessage = res.message;
            this.toasterService.presentToast(this.errorMessage, 'danger');
          }
        },
        (err: any) => {
          let errortext = err.error.statusText;
          let message = "Network Issue. "
          if (errortext === 'Unknown Error') {
            message += 'Please enter email/username or password.';
          } else {
            message += err.error.message;
          }
          this.errorMessage = message;
            this.toasterService.presentToast(this.errorMessage, 'danger');
        }
      );
    } else {
      this.errorMessage = 'Please enter email/username or password.';
      this.toasterService.presentToast(this.errorMessage, 'danger');
    }

  }
}
