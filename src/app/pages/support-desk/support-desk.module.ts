import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SupportDeskPageRoutingModule } from './support-desk-routing.module';

import { SupportDeskPage } from './support-desk.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SupportDeskPageRoutingModule
  ],
  declarations: [SupportDeskPage]
})
export class SupportDeskPageModule {}
