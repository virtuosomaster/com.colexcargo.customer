import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateShipmentPage } from './create-shipment.page';

const routes: Routes = [
  {
    path: '',
    component: CreateShipmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateShipmentPageRoutingModule {}
