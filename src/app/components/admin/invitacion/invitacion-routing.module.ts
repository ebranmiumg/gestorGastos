import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvitacionComponent } from './invitacion.component';

const routes: Routes = [{ path: '', component: InvitacionComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvitacionRoutingModule { }
