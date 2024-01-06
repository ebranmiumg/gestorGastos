import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AnioComponent } from './components/admin/anio/anio.component';
import { MesComponent } from './components/admin/mes/mes.component';
import { CategoriaComponent } from './components/admin/categoria/categoria.component';
import { PresupuestoComponent } from './components/presupuesto/presupuesto.component';
import { IngresosComponent } from './components/ingresos/ingresos.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'presupuesto', component: PresupuestoComponent },
  { path: 'ingreso', component: IngresosComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'admin', children: [
    { path: 'anio', component: AnioComponent },
    { path: 'mes', component: MesComponent },
    { path: 'categoria', component: CategoriaComponent }
  ] },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
