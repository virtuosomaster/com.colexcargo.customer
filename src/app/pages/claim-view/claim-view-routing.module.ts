import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaimViewPage } from './claim-view.page';

const routes: Routes = [
  {
    path: '',
    component: ClaimViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimViewPageRoutingModule {}
