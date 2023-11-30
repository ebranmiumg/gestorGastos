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
import { Gasto } from 'src/app/models/gasto.model';
import { Mes } from 'src/app/models/mes.model';


//GRAFICAS
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Define la función que devuelve la suma de los costos por mes
function getSumByMonth(gastos: Gasto[]): { mes: string, suma: number }[] {
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
    { name: 'Diciembre', numMes: '12' }
  ];

  // Define el array de objetos que contiene la suma de los costos por mes
  const sumByMonth = mesesArray.map(mes => {
    const suma = gastos.reduce((acc, curr) => {
      if (curr.mesGasto === mes.name) {
        return Number(acc) + Number(curr.costo);
      } else {
        return acc;
      }
    }, 0);
    return { mes: mes.name, suma };
  });

  // Filtra los meses con suma mayor a 0
  const filteredSumByMonth = sumByMonth.filter(mes => mes.suma > 0);

  return filteredSumByMonth;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // CONFIGURACION GRAFICA
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  // Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      /* datalabels: {
        formatter: (value: any, ctx: any) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      }, */
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
      data: [],
    }],
  };

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  fechaActual = new Date();
  gastoAddModel: Gasto = { personGasto: '', anioGasto: this.fechaActual.getFullYear().toString(), mesGasto: '' ,fechaGasto: '', categoriaGasto: '', descripcionGasto: '', costo: 0 };
  gastoGetModel: any;
  mesModel: Observable<Mes[]>;
  anioModel: Observable<Anio[]>;
  catModel: Observable<Categoria[]>;
  gastoModel: Observable<Gasto[]>;
  sumByMonth: { mes: string, suma: number }[] = [];
  sumaPorCategoria$: Observable<{ nombreCategoria: String, suma: Number }[]>;
  sumaPorCategoriaList: { nombreCategoria: String, suma: number }[] = [];

  getDetalleXMes: Gasto[] = [];

  anioSeleccionado: String = "";
  mesSeleccionado: String = "";


  // VARIABLES MODALS
  mesXAnioModal = false;
  nuevoGastoModal = false;
  detalleXMesModal = false;

  constructor() {
    const mesColllection = query(collection(this.firestore, 'mes'), orderBy('orden','asc'));
    const anioColllection = collection(this.firestore, 'anio');
    const catColllection = query(collection(this.firestore, 'Categoria'), orderBy('orden','asc'))
    const gastoColllection = collection(this.firestore, 'Gasto');

    this.catModel = collectionData(catColllection) as Observable<Categoria[]>;
    this.mesModel = collectionData(mesColllection) as Observable<Mes[]>;
    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;
    this.gastoModel= collectionData(gastoColllection ) as Observable<Gasto[]>;
    /* this.gastoModel.pipe(
      map(gastos => getSumByMonth(gastos))
    ).subscribe(sumByMonth => {
      console.log(sumByMonth);
      this.sumByMonth = sumByMonth;
      console.log(this.sumByMonth);
    }); */


    this.sumaPorCategoria$ = combineLatest([this.gastoModel, this.catModel]).pipe(
      map(([gastos, categorias]) => {
        return categorias.map(cat => {
          const suma = gastos
            .filter(gasto => gasto.categoriaGasto === cat.nombreGasto)
            .reduce((acc, curr) => Number(acc) + Number(curr.costo), 0);
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        });
      })
    );
  }

  addGastoCollection(){
    addDoc(collection(this.firestore, 'Gasto'), this.gastoAddModel).then((documentReference: DocumentReference) => {
      console.log(documentReference);

      this.nuevoGastoModal = false;
   })
  }

  // OBTIENE LOS GASTOS POR ANIO AGRUPADO POR MES Y FILTRADO POR LOS MESES QUE SE REALIZO GASTO
  async getGastosXAnio(vAnio: Number){
    const gastoQuery = query(collection(this.firestore, 'Gasto'), where('anioGasto', '==', vAnio.toString()));
    const querySnapshot = await getDocs(gastoQuery);
    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map(doc => doc.data() as Gasto);

    // Filtrar los gastos por el año especificado y aplicar la función getSumByMonth
    const sumByMonth = getSumByMonth(gastos);

    // Actualizar el estado con los gastos filtrados y su suma por mes
    this.sumByMonth = sumByMonth;
  }

  //OBTIENE LOS GASTOS REALIZADOS ESE MES POR CATEGORIA
  async getGastosDetalleXMes(vAnio: Number, vMes: string) {
    this.anioSeleccionado = "";
    this.mesSeleccionado = "";

    const gastoQuery = query(
      collection(this.firestore, 'Gasto'),
      where('anioGasto', '==', vAnio.toString()),
      where('mesGasto', '==', vMes)
    );
    const querySnapshot = await getDocs(gastoQuery);

    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map(doc => doc.data() as Gasto);

    // Agrupar y sumar los gastos por categoría
    const sumaPorCategoria = this.catModel.pipe(
      map(categorias => {
        return categorias.map(cat => {
          const suma = gastos
            .filter(gasto => gasto.categoriaGasto === cat.nombreGasto)
            .reduce((acc, curr) => Number(acc) + Number(curr.costo), 0);
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        })
        //.filter(cat => cat.suma > 0); // Filtra las categorías con suma mayor a 0
      })
    );
    // Actualizar el estado con la suma de gastos por categoría
    sumaPorCategoria.subscribe(resultado => {
      console.log(resultado);
      this.sumaPorCategoriaList = resultado;
      this.mesXAnioModal = true
      this.anioSeleccionado = vAnio.toString();
      this.mesSeleccionado = vMes;
      this.pieChartData = {
        labels: [],
        datasets: [
          {
          data: [],
        }],
      };
      resultado.filter(cat => cat.suma > 0).map(resultado => {
        this.pieChartData.labels?.push(resultado.nombreCategoria.toString())
        this.pieChartData.datasets[0].data.push(resultado.suma)
      })



    });
  }

  // OBTIENE EL DETALLE DE LA CATEGORIA SELECCIONADA EN EL MES
  async getDetalleCategoriaXMes(vCategoria: String){
    const gastoQuery = query(collection(this.firestore, 'Gasto'), where('anioGasto', '==', this.anioSeleccionado.toString()),
        where('mesGasto', '==', this.mesSeleccionado.toString()), where('categoriaGasto', '==', vCategoria.toString()));
    const querySnapshot = await getDocs(gastoQuery);
    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map(doc => doc.data() as Gasto);

    this.getDetalleXMes = gastos;
    this.detalleXMesModal = true


  }

}
