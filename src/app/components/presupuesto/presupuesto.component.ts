import { Component, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  getDocs,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { Anio } from 'src/app/models/anio.model';
import { Mes } from 'src/app/models/mes.model';
import { Presupuesto } from 'src/app/models/prespuesto.model';

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.scss'],
})
export class PresupuestoComponent {
  private firestore: Firestore = inject(Firestore);
  fechaActual = new Date();
  presupuestoForm: FormGroup;
  crearPresupuesto: boolean = false;
  anioModel: Observable<Anio[]>;
  presupuestoModel: Observable<Presupuesto[]>;
  getPresupuestoXAnio: Presupuesto[] = [];
  getPresupuestoSelected: Presupuesto = {
    descripcionPresupuesto: '',
    anioPresupuesto: '',
    categoriaPresupuesto: '',
    elementosPresupuesto: [],
    mesPresupuesto: '',
    monto: 0,
    personaPresupuesto: '',
  };

  mesModel: Observable<Mes[]>;

  // VARIABLES ALERTAS
  showAlertaFormulario: boolean = false;


  // VARIABLES MODALES
  detallePresupuestoXMes: boolean = false;

  constructor(private fb: FormBuilder) {
    const anioColllection = query(
      collection(this.firestore, 'anio'),
      orderBy('numeroAnio', 'asc')
    );
    const presupuestoColllection = query(
      collection(this.firestore, 'Presupuesto'),
      orderBy('anioPresupuesto', 'asc')
    );

    const mesColllection = query(
      collection(this.firestore, 'mes'),
      orderBy('orden', 'asc')
    );
    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;
    this.mesModel = collectionData(mesColllection) as Observable<Mes[]>;
    this.presupuestoModel = collectionData(
      presupuestoColllection
    ) as Observable<Presupuesto[]>;

    this.presupuestoForm = this.fb.group({
      personaPresupuesto: ['', Validators.required],
      anioPresupuesto: [
        { value: this.fechaActual.getFullYear().toString(), disabled: true },
        Validators.required,
      ],
      mesPresupuesto: ['', Validators.required],
      categoriaPresupuesto: ['', Validators.required],
      descripcionPresupuesto: ['', Validators.required],
      monto: [{ value: 0, disabled: true }, Validators.required],
      elementosPresupuesto: this.fb.array([]),
    });
  }

  get elementosPresupuesto() {
    return this.presupuestoForm.get('elementosPresupuesto') as FormArray;
  }

  abrirModalPresupuesto() {
    this.crearPresupuesto = true;
    this.showAlertaFormulario = false;
    this.presupuestoForm.reset(); // Esto resetea el formulario
  }





  agregarElementoPresupuesto() {
    const elementoPresupuesto = this.fb.group({
      nombreElemento: ['', Validators.required],
      montoElemento: [0, Validators.required],
    });

    this.subscribirACambiosDeMonto(elementoPresupuesto);
    this.elementosPresupuesto.push(elementoPresupuesto);
  }

  private subscribirACambiosDeMonto(elementoPresupuesto: FormGroup) {
    const montoElementoControl = elementoPresupuesto.get('montoElemento');

    if (montoElementoControl) {
      montoElementoControl.valueChanges.subscribe(() => {
        this.actualizarMontoTotal();
      });
    }
  }

  private actualizarMontoTotal() {
    const montoControl = this.presupuestoForm.get('monto');
    if (montoControl) {
      const total = this.elementosPresupuesto.controls
        .map((control) => control.get('montoElemento')?.value || 0)
        .reduce((acc, value) => acc + value, 0);

      montoControl.setValue(total);
    }
  }

  async agregarPresupuesto(presupuesto: any) {
    try {
      if (this.presupuestoForm.valid) {
        this.showAlertaFormulario = false;
        let sumaTotal = 0;
        presupuesto.elementosPresupuesto.map((item: any) => {
          sumaTotal += item.montoElemento;
        });

        presupuesto.monto = sumaTotal;

        const docRef = await addDoc(
          collection(this.firestore, 'Presupuesto'),
          presupuesto
        );
        console.log('Documento agregado con ID: ', docRef);
      } else {
        this.showAlertaFormulario = true;

        console.log('Formulario no es válido');
      }
    } catch (e) {
      console.error('Error al agregar documento: ', e);
    }
  }

  async getPrespuestoAnio(vAnio: Number) {
    const presupuestoColllection = query(
      collection(this.firestore, 'Presupuesto'),
      where('anioPresupuesto', '==', vAnio),
      orderBy('anioPresupuesto', 'asc')
    );
    const querySnapshot = await getDocs(presupuestoColllection);
    // Convertir los documentos a objetos de tipo Gasto
    const prespuestos = querySnapshot.docs.map(
      (doc) => doc.data() as Presupuesto
    );
    console.log(prespuestos);

    this.getPresupuestoXAnio = prespuestos;
  }

  presupuestoSelected(vPrespSelec: Presupuesto) {
    this.getPresupuestoSelected = {
      descripcionPresupuesto: '',
      anioPresupuesto: '',
      categoriaPresupuesto: '',
      elementosPresupuesto: [],
      mesPresupuesto: '',
      monto: 0,
      personaPresupuesto: '',
    };

    this.getPresupuestoSelected = vPrespSelec;
    this.detallePresupuestoXMes = true;
  }
}
