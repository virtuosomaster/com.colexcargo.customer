import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimViewPageRoutingModule } from './claim-view-routing.module';

import { ClaimViewPage } from './claim-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ClaimViewPageRoutingModule
  ],
  declarations: [ClaimViewPage]
})
export class ClaimViewPageModule { }
