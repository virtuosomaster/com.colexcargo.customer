import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SupportViewPageRoutingModule } from './support-view-routing.module';

import { SupportViewPage } from './support-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SupportViewPageRoutingModule
  ],
  declarations: [SupportViewPage]
})
export class SupportViewPageModule { }
