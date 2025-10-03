import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared';
import { IonicModule } from '@ionic/angular';

import { AddTicketPageRoutingModule } from './add-ticket-routing.module';

import { AddTicketPage } from './add-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    IonicModule,
    AddTicketPageRoutingModule
  ],
  declarations: [AddTicketPage]
})
export class AddTicketPageModule {}
