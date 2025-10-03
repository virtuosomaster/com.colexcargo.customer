import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared';
import { IonicModule } from '@ionic/angular';

import { AddClaimPageRoutingModule } from './add-claim-routing.module';

import { AddClaimPage } from './add-claim.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    IonicModule,
    AddClaimPageRoutingModule
  ],
  declarations: [AddClaimPage]
})
export class AddClaimPageModule {}
