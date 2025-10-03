import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index', // Redirect to the login page on initial load
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'index/login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'update-password/:email',
    loadChildren: () => import('./pages/update-password/update-password.module').then(m => m.UpdatePasswordPageModule)
  },
  {
    path: 'create-shipment',
    loadChildren: () => import('./pages/create-shipment/create-shipment.module').then(m => m.CreateShipmentPageModule)
  },
  {
    path: 'shipment/:shipmentID',
    loadChildren: () => import('./pages/shipment/shipment.module').then(m => m.ShipmentPageModule)
  },
  {
    path: 'add-ticket',
    loadChildren: () => import('./pages/add-ticket/add-ticket.module').then( m => m.AddTicketPageModule)
  },
  {
    path: 'add-claim',
    loadChildren: () => import('./pages/add-claim/add-claim.module').then( m => m.AddClaimPageModule)
  },
  {
    path: 'claim-view/:claimID',
    loadChildren: () => import('./pages/claim-view/claim-view.module').then( m => m.ClaimViewPageModule)
  },
  {
    path: 'support-view/:supportID',
    loadChildren: () => import('./pages/support-view/support-view.module').then( m => m.SupportViewPageModule)
  },
  {
    path: 'index',
    loadChildren: () => import('./index/index.module').then(m => m.IndexPageModule)
  },
  {
    path: 'view', // This route should be handled on its own as it's not a tab.
    loadChildren: () => import('./pages/view/view.module').then(m => m.ViewPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
