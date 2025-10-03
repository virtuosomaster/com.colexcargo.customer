import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '../../services/toaster.service';
import { HttpClient } from '@angular/common/http';

import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';
import { Browser } from '@capacitor/browser';
import { AuthConstants } from 'src/app/config/auth-constants';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-claim-view',
  templateUrl: './claim-view.page.html',
  styleUrls: ['./claim-view.page.scss'],
})
export class ClaimViewPage implements OnInit {

  private authUser: any;
  public ticketID: any;
  public shipmentFields: any = [];
  public ticketData: any = [];
  public BillingData: any = [];
  public deliveryData: any = [];
  public errorMessage: String = '';
  public file_data: any = [];
  public lastUpdate: any = [];
  updateTicketForm: FormGroup;
  public files: PickedFile[] = [];

  // Flags
  processFlag = true;

  viewDetails: String = 'Add Response';
  showDetails: boolean = false;
  viewCommentIcon: String = 'caret-down-circle-outline';
  showComment: boolean = false;
  showCommentID: any;
  canUpdate: any;
  canUpload: any;

  validation_messages = {
    'ticket_comment_reply': [
      { type: 'required', message: 'Please enter your response.' },
    ],
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private shipmentService: ShipmentService,
    private activatedRoute: ActivatedRoute,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private _location: Location,
    private toasterService: ToasterService,
    private plt: Platform,
    private http: HttpClient,
    private storageService: StorageService

  ) { }


  ngOnInit() {
    this.storageService.get(AuthConstants.SUPPORTDESKACTIVE).then(res => {
      this.canUpdate = res.access.can_update_support;
      this.canUpload = res.access.enable_file_upload;
    });

    this.auth.userData$.subscribe((res: any) => {
      this.authUser = res;
      this.setParamInvoiceID();
    });
    this.updateTicketForm = new FormGroup({
      ticket_comment_reply: new FormControl('', Validators.required),
    });
  }



  ionViewWillEnter() {
    this.presentLoading();

    // Get the shipment Information using the ID
    this.shipmentService.get(this.authUser.apiKey, '/support/id/' + this.ticketID).subscribe({
      next: (res: any) => {
        this.loadingController.dismiss();
        this.ticketData = res;
        this.processFlag = false;

        for (const [key, value] of Object.entries(this.ticketData.files)) {
          this.file_data.push(value);
        }

        if (this.ticketData.wpc_tickets_history) {
          this.lastUpdate = this.ticketData.wpc_tickets_history[0];
        }
      },

      error: err => {
        let message = "Network Issue. "
        message += err.error.message;
        this.errorMessage = message;
      }
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing data please wait...'
    });
    await loading.present();
  }

  viewTicketDetails() {
    this.showDetails = !this.showDetails;
    this.viewDetails = this.viewDetails == 'Add Response' ? 'Hide Details' : 'Add Response';
  }

  viewComment(id: any) {
    this.showComment = !this.showComment;
    this.viewCommentIcon = this.viewCommentIcon == 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
    this.showCommentID = id;
  }


  setParamInvoiceID() {
    this.activatedRoute.paramMap.subscribe(
      (data) => {
        this.ticketID = data.get('claimID');
      }
    );
  }

  goToShipments() {
    this._location.back();
  }

  resetForms() {
    this.updateTicketForm.reset();
  }

  submitupdateTicket() {
    this.updateTicketForm.markAllAsTouched();

    let errors: any = this.updateTicketForm.controls['ticket_comment_reply'].errors;
    let postData = this.updateTicketForm.value;
    postData['claim_id'] = this.ticketID;
    // postData['photos']=this.photoService.photos;
    postData['media'] = this.files;

    //Check for errors first
    if (!errors) {
      this.presentLoading();
      this.shipmentService.post(this.authUser.apiKey + '/claim/update', postData).subscribe({
        next: (res: any) => {
          this.loadingController.dismiss();
          if (res.status == "success") {
            this.resetForms();
            // console.log(res);
            this.toasterService.presentToast('Ticket ' + res.claim_number + ' successfully responded.', 'success', 6000);
            this.ionViewWillEnter();
          } else {
            // console.log(res);
            this.toasterService.presentToast('Request failed. ' + res.message, 'danger', 3000);
          }
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (err: any) => {
          this.presentLoading();
          let message = "Error. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      });
    } else {
      this.toasterService.presentToast('Fillout the required fields!', 'danger', 3000);
    }
  }


  public async pickFile(): Promise<void> {
    const types = this.updateTicketForm.get('types')?.value || [];
    const limit = 0;
    const readData = true;
    const { files } = await FilePicker.pickFiles({ types, limit, readData });
    this.files = files;
    // console.log(this.files);
    //path	string	The path of the file. Only available on Android and iOS.
  }

  openCapacitorSite = async (url: any) => {
    await Browser.open({ url: url });
  }
}