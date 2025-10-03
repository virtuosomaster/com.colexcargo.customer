import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportDeskPage } from './support-desk.page';

const routes: Routes = [
  {
    path: '',
    component: SupportDeskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportDeskPageRoutingModule {}
