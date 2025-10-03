import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportViewPage } from './support-view.page';

const routes: Routes = [
  {
    path: '',
    component: SupportViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportViewPageRoutingModule {}
