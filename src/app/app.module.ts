import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { SideNavComponent } from './components/general/side-nav/side-nav.component';
import { HeaderComponent } from './components/general/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AnioComponent } from './components/admin/anio/anio.component';
import { MesComponent } from './components/admin/mes/mes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { CategoriaComponent } from './components/admin/categoria/categoria.component';

import { NgChartsModule } from 'ng2-charts';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { PresupuestoComponent } from './components/presupuesto/presupuesto.component';


@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    HeaderComponent,
    HomeComponent,
    AnioComponent,
    MesComponent,
    CategoriaComponent,
    FormatDatePipe,
    PresupuestoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    provideFirebaseApp(() => initializeApp({"projectId":"gestorgastos2023-c2f31","appId":"1:11084712502:web:0c2081eae98cabb9dd6697","storageBucket":"gestorgastos2023-c2f31.appspot.com","apiKey":"AIzaSyAgy7tgZNNpjKpZl7W_GlqHDpqTDjnbaaw","authDomain":"gestorgastos2023-c2f31.firebaseapp.com","messagingSenderId":"11084712502"})),
    provideFirestore(() => getFirestore()),
    FormsModule,
    BrowserAnimationsModule,
    CommonModule,
    NgChartsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
