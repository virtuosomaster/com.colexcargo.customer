import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { homeGuard } from '../guards/home.guard';
import { UserDataResolver } from '../resolvers/user-data.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [homeGuard],
    resolve: {
      userData: UserDataResolver,
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'shipments/:status',
        loadChildren: () => import('../pages/shipments/shipments.module').then(m => m.ShipmentsPageModule)
      },
      {
        path: 'shipment/:shipmentID',
        loadChildren: () => import('../pages/shipment/shipment.module').then(m => m.ShipmentPageModule)
      },
      {
        path: 'accounts',
        loadChildren: () => import('../pages/account/account.module').then(m => m.AccountPageModule)
      },
      {
        path: 'support-desk',
        loadChildren: () => import('../pages/support-desk/support-desk.module').then(m => m.SupportDeskPageModule)
      },
      {
        path: 'claims',
        loadChildren: () => import('../pages/claims/claims.module').then(m => m.ClaimsPageModule)
      },
      {
        path: 'view',
        loadChildren: () => import('../pages/view/view.module').then( m => m.ViewPageModule)
      },
      {
        path: 'create',
        loadChildren: () => import('../pages/create-shipment/create-shipment.module').then( m => m.CreateShipmentPageModule)
      },
      {
        path: '',
        redirectTo: '/home/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule { }
