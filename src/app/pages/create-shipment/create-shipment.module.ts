import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateShipmentPageRoutingModule } from './create-shipment-routing.module';

import { CreateShipmentPage } from './create-shipment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,ReactiveFormsModule,
    CreateShipmentPageRoutingModule,

  ],
  declarations: [CreateShipmentPage]
})
export class CreateShipmentPageModule {}
