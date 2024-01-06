import { Component, ViewChild, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  getDocs,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Anio } from 'src/app/models/anio.model';
import { Categoria } from 'src/app/models/categoria.model';
import { Ingreso } from 'src/app/models/ingreso.model';
import { Mes } from 'src/app/models/mes.model';


// Define la función que devuelve la suma de los ingresos por mes
function getSumByMonth(gastos: Ingreso[]): { mes: string; suma: number }[] {
  // Define el array de meses
  const mesesArray = [
    { name: 'Enero', numMes: '1' },
    { name: 'Febrero', numMes: '2' },
    { name: 'Marzo', numMes: '3' },
    { name: 'Abril', numMes: '4' },
    { name: 'Mayo', numMes: '5' },
    { name: 'Junio', numMes: '6' },
    { name: 'Julio', numMes: '7' },
    { name: 'Agosto', numMes: '8' },
    { name: 'Septiembre', numMes: '9' },
    { name: 'Octubre', numMes: '10' },
    { name: 'Noviembre', numMes: '11' },
    { name: 'Diciembre', numMes: '12' },
  ];

  // Define el array de objetos que contiene la suma de los costos por mes
  const sumByMonth = mesesArray.map((mes) => {
    const suma = gastos.reduce((acc, curr) => {
      if (curr.mesIngreso === mes.name) {
        return Number(acc) + Number(curr.ingreso);
      } else {
        return acc;
      }
    }, 0);
    return { mes: mes.name, suma };
  });

  // Filtra los meses con suma mayor a 0
  const filteredSumByMonth = sumByMonth.filter((mes) => mes.suma > 0);

  return filteredSumByMonth;
}


@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss']
})
export class IngresosComponent {
  private firestore: Firestore = inject(Firestore);
  anioModel: Observable<Anio[]>;
  sumByMonth: { mes: string; suma: number }[] = [];
  catModel: Observable<Categoria[]>;
  mesModel: Observable<Mes[]>;
  aniosConMasDeUnIngreso: { numeroAnio: string; }[] = [];

  fechaActual = new Date();
  ingresoAddModel: Ingreso = {
    personIngreso: '',
    anioIngreso: this.fechaActual.getFullYear().toString(),
    mesIngreso: '',
    fechaIngreso: '',
    categoriaIngreso: '',
    descripcionIngreso: '',
    ingreso: 0,
  };

  // VARIABLES MODALS
  nuevoIngresoModal: boolean = false;

  constructor() {
    const mesColllection = query(
      collection(this.firestore, 'mes'),
      orderBy('orden', 'asc')
    );
    const anioColllection = query(
      collection(this.firestore, 'anio'),
      orderBy('numeroAnio', 'asc')
    );
    const catColllection = query(
      collection(this.firestore, 'Categoria'),
      where('tipoCategoria', '==', 'Ingreso'),
      orderBy('orden', 'asc')
    );

    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;
    this.catModel = collectionData(catColllection) as Observable<Categoria[]>;
    this.mesModel = collectionData(mesColllection) as Observable<Mes[]>;




  }

  ngOnInit() {
    this.loadYearsWithMoreThanOneIngreso();
  }

  async loadYearsWithMoreThanOneIngreso() {
    this.aniosConMasDeUnIngreso = await this.getYearsWithIngresos();
  }

  async getYearsWithIngresos() {
    const ingresoQuery = query(
      collection(this.firestore, 'Ingreso'),
      orderBy('anioIngreso', 'asc')
    );
    const querySnapshot = await getDocs(ingresoQuery);

    // Convertir los documentos a objetos de tipo ingreso
    const ingresos = querySnapshot.docs.map((doc) => doc.data() as Ingreso);

    // Agrupar los ingresos por año
    const ingresosPorAnio = ingresos.reduce((acc, ingreso) => {
      const anio = ingreso.anioIngreso;
      if (!acc[anio.toString()]) {
        acc[anio.toString()] = []; // Inicializar el arreglo para el año si aún no existe
      }
      acc[anio.toString()].push(ingreso);
      return acc;
    }, {} as Record<string, Ingreso[]>);

    // Crear un arreglo de objetos donde cada objeto tiene la forma { numeroAnio: valorAnio }
    const aniosConIngresos = Object.keys(ingresosPorAnio).map(anio => {
      return { numeroAnio: anio };
    });
    console.log(aniosConIngresos);


    return aniosConIngresos;
  }
   // OBTIENE LOS INGRESOS POR ANIO AGRUPADO POR MES Y FILTRADO POR LOS MESES QUE SE REALIZO GASTO
   async getIngresosXAnio(vAnio: String) {
    const ingresoQuery = query(
      collection(this.firestore, 'Ingreso'),
      where('anioIngreso', '==', vAnio.toString())
    );
    const querySnapshot = await getDocs(ingresoQuery);
    // Convertir los documentos a objetos de tipo ingreso
    const ingresos = querySnapshot.docs.map((doc) => doc.data() as Ingreso);

    // Filtrar los ingresos por el año especificado y aplicar la función getSumByMonth
    const sumByMonth = getSumByMonth(ingresos);

    // Actualizar el estado con los ingresos filtrados y su suma por mes
    this.sumByMonth = sumByMonth;
  }

  addIngresoCollection() {
    addDoc(collection(this.firestore, 'Ingreso'), this.ingresoAddModel).then(
      (documentReference: DocumentReference) => {
        console.log(documentReference);

        this.nuevoIngresoModal = false;
      }
    );
  }
}
