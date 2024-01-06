import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'presupuesto',
        loadChildren: () =>
          import('../presupuesto/presupuesto.module').then(
            (m) => m.PresupuestoModule
          ),
      },
      {
        path: 'ingreso',
        loadChildren: () =>
          import('../ingresos/ingresos.module').then((m) => m.IngresosModule),
      },
      {
        path: 'gastos',
        loadChildren: () =>
          import('../gastos/gastos.module').then((m) => m.GastosModule),
      },
      {
        path: 'admin',
        children: [
          {
            path: 'anio',
            loadChildren: () =>
              import('../admin/anio/anio.module').then(
                (m) => m.AnioModule
              ),
          },
          {
            path: 'grupos',
            loadChildren: () =>
              import('../admin/grupos/grupos.module').then(
                (m) => m.GruposModule
              ),
          },
          {
            path: 'mes',
            loadChildren: () =>
              import('../admin/mes/mes.module').then(
                (m) => m.MesModule
              ),
          },
          {
            path: 'categoria',
            loadChildren: () =>
              import('../admin/categoria/categoria.module').then(
                (m) => m.CategoriaModule
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
