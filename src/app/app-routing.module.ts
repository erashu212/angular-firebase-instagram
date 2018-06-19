import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { ActivateComponent } from './activate/activate.component';

const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'activate', component: ActivateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
