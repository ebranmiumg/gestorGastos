import { Component, ViewChild, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  getDoc,
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
import { Grupo } from 'src/app/models/grupo.model';
import { AuthService } from 'src/app/services/auth.service';

// Define la función que devuelve la suma de los costos por mes
function getSumByMonth(gastos: Gasto[]): { mes: string; suma: number }[] {
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
      if (curr.mesGasto === mes.name) {
        return Number(acc) + Number(curr.costo);
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
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss'],
})
export class GastosComponent {
  // CONFIGURACION GRAFICA TODOS
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
      },
    ],
  };
  // VARIABLE GRAFICA ERICK
  public pieChartDataErick: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };
  // VARIABLE GRAFICA JOHANA
  public pieChartDataJohana: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];

  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  fechaActual = new Date();
  gastoAddModel: Gasto = {
    personGasto: '',
    personaUiDGasto: '',
    anioGasto: this.fechaActual.getFullYear().toString(),
    mesGasto: '',
    fechaGasto: '',
    categoriaGasto: '',
    nombreCategoriaGasto: '',
    descripcionGasto: '',
    costo: 0,
    grupoGasto: '',
  };
  gastoGetModel: any;
  mesModel: Observable<Mes[]>;
  anioModel: Observable<Anio[]>;
  catModel: Observable<Categoria[]>;
  gastoModel: Observable<Gasto[]>;
  sumByMonth: { mes: string; suma: number }[] = [];
  sumaPorCategoria$: Observable<{ nombreCategoria: String; suma: Number }[]>;

  //VARIABLE DETALLE X MES
  sumaPorCategoriaList: { nombreCategoria: String; suma: number }[] = [];
  sumaPorCategoriaListErick: { nombreCategoria: String; suma: number }[] = [];
  sumaPorCategoriaListJohana: { nombreCategoria: String; suma: number }[] = [];

  //NUEVOS MODELOS
  public grupoModel: Array<{ id: string; data: Grupo }> = [];
  public categoriaModel: Array<{ id: string; data: Categoria }> = [];
  categoriaSeleccionada: { id: string; data: Categoria } | null = null;
  gastosPorAnio: { [anio: number]: { [mes: number]: Gasto[] } } = {};
  gruposConGastos: any[] = [];

  getDetalleXMes: Gasto[] = [];

  uidUsuario: String = '';
  nombreUsuarioLogeado: String = '';
  anioSeleccionado: String = '';
  mesSeleccionado: String = '';

  // VARIABLES MODALS
  mesXAnioModal = false;
  nuevoGastoModal = false;
  detalleXMesModal = false;

  constructor(private authService: AuthService) {
    this.uidUsuario = this.authService.userUID!;
    this.nombreUsuarioLogeado = this.authService.userName!;
    console.log(this.uidUsuario);

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
      where('tipoCategoria', '==', 'Gasto'),
      orderBy('orden', 'asc')
    );

    const grupoColllection = query(collection(this.firestore, 'Grupos'));

    // Obtén los documentos y sus IDs
    getDocs(grupoColllection).then((querySnapshot) => {
      this.grupoModel = querySnapshot.docs
        .filter((doc) =>
          doc
            .data()['integrantes'].some(
              (integrante: any) => integrante.uidIntegrante === this.uidUsuario
            )
        )
        .map((doc) => {
          // Aquí, doc.id te dará el ID del documento
          const data = doc.data() as Grupo; // Asegúrate de que el tipo de datos es correcto
          return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
        });
      console.log(this.grupoModel);
    });

    const gastoColllection = collection(this.firestore, 'Gasto');

    this.catModel = collectionData(catColllection) as Observable<Categoria[]>;
    this.mesModel = collectionData(mesColllection) as Observable<Mes[]>;
    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;
    this.gastoModel = collectionData(gastoColllection) as Observable<Gasto[]>;

    this.catModel.subscribe((gastos) => {
      console.log(gastos);
    });
    /* this.gastoModel.pipe(
       map(gastos => getSumByMonth(gastos))
     ).subscribe(sumByMonth => {
       console.log(sumByMonth);
       this.sumByMonth = sumByMonth;
       console.log(this.sumByMonth);
     }); */

    this.sumaPorCategoria$ = combineLatest([
      this.gastoModel,
      this.catModel,
    ]).pipe(
      map(([gastos, categorias]) => {
        return categorias.map((cat) => {
          const suma = gastos
            .filter((gasto) => gasto.categoriaGasto === cat.nombreGasto)
            .reduce((acc, curr) => Number(acc) + Number(curr.costo), 0);
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        });
      })
    );

    this.obtenerYOrganizarGastos();
  }

  async ngOnInit() {
    await this.obtenerGruposYGastos();
  }

  async obtenerGruposYGastos() {
    const userUID = this.authService.userUID; // Asume que tienes el UID del usuario
    const gruposRef = collection(this.firestore, 'Grupos');
    const gruposSnapshot = await getDocs(gruposRef);
    const grupos: any[] = [];
  
    gruposSnapshot.forEach((doc) => {
      const grupo = { id: doc.id, ...doc.data() as any};
      const esIntegrante = grupo.integrantes.some((integrante: { uidIntegrante: string | null; }) => integrante.uidIntegrante === userUID);
      if (esIntegrante) {
        
        grupos.push(grupo);
      }
    });
    console.log('grupo ',grupos);
    // Para cada grupo que el usuario es integrante, obtén los gastos asociados
    for (const grupo of grupos) {
      
      
      const gastosRef = collection(this.firestore, 'Gasto');
      const gastosSnapshot = await getDocs(query(gastosRef, where('grupoGasto', '==', grupo.id)));
      let gastosPorAnioMes: {[anio: number]: { [mes: number]: { todos: any[], porPersona: any, totalGastoMes:number }}} = {};
      gastosSnapshot.forEach(doc => {
        const gasto = doc.data();
        const fecha = new Date(gasto['fechaGasto']);
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth() + 1;
  
        if (!gastosPorAnioMes[anio]) {
          gastosPorAnioMes[anio] = {};
        }
        if (!gastosPorAnioMes[anio][mes]) {
          gastosPorAnioMes[anio][mes] = { todos: [], porPersona: {}, totalGastoMes: 0 };
        }
        gastosPorAnioMes[anio][mes].todos.push(gasto);
  
        const personKey = gasto['personaUiDGasto'];
        if (!gastosPorAnioMes[anio][mes].porPersona[personKey]) {
          gastosPorAnioMes[anio][mes].porPersona[personKey] = [];
        }
        gastosPorAnioMes[anio][mes].porPersona[personKey].push(gasto);
        gastosPorAnioMes[anio][mes].totalGastoMes += Number(gasto['costo']);
      });
  
      this.gruposConGastos.push({
        nombre: grupo.nombreGrupo,
        gastos: gastosPorAnioMes,
        totalGastos: gastosSnapshot.docs.length // Cantidad total de gastos para este grupo
      });
    }
  
    // Ordena los grupos por la cantidad total de gastos, de mayor a menor
    this.gruposConGastos = this.gruposConGastos.sort((a, b) => b.totalGastos - a.totalGastos);
    console.log('gruposConGastos ',this.gruposConGastos);
    
  }
  
  


  obtenerYOrganizarGastos() {
    const gastosRef = collection(this.firestore, 'Gasto');
    const gastosQuery = query(gastosRef);
    collectionData(gastosQuery, { idField: 'id' }).subscribe(gastos => {     
      gastos.forEach((gasto: any) => {
        const fecha = gasto.fechaGasto instanceof Date ? gasto.fechaGasto : new Date(gasto.fechaGasto);
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
        const gastoMapeado: Gasto = {
          personGasto: gasto.personGasto,
          personaUiDGasto: gasto.personaUiDGasto,
          anioGasto: gasto.anioGasto,
          mesGasto: gasto.mesGasto,
          fechaGasto: gasto.fechaGasto,
          categoriaGasto: gasto.categoriaGasto,
          nombreCategoriaGasto: gasto.nombreCategoriaGasto,
          descripcionGasto: gasto.descripcionGasto,
          costo: gasto.costo,
          grupoGasto: gasto.grupoGasto,
          // Asegúrate de incluir aquí cualquier otra propiedad necesaria
        };
    
        if (!this.gastosPorAnio[anio]) {
          this.gastosPorAnio[anio] = {};
        }
        if (!this.gastosPorAnio[anio][mes]) {
          this.gastosPorAnio[anio][mes] = [];
        }
        this.gastosPorAnio[anio][mes].push(gastoMapeado);
      });
    });
    console.log('GASTOXANIO ', this.gastosPorAnio);
    
  }
  getAnios(indexGrupo: number): number[] {
    return Object.keys(this.gruposConGastos[indexGrupo].gastos).map(Number).sort();
  }
  
    getMeses(indexGrupo: number, anio: number): any[] {
      return Object.keys(this.gruposConGastos[indexGrupo].gastos[anio]).map(Number).sort().map(mes => ({ nombre: this.mesToString(mes), numero: mes }));
    }
    
    // Conversión de número de mes a nombre de mes
    mesToString(mes: number): string {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return meses[mes - 1];
    }


  addGastoCollection() {    
    this.gastoAddModel.personGasto = this.nombreUsuarioLogeado;
    this.gastoAddModel.personaUiDGasto = this.uidUsuario;
    this.gastoAddModel.anioGasto = this.fechaActual.getFullYear().toString();
    this.gastoAddModel.mesGasto = this.mesToString(this.fechaActual.getMonth());
    this.gastoAddModel.categoriaGasto = this.categoriaSeleccionada?.id || '';
    this.gastoAddModel.nombreCategoriaGasto = this.categoriaSeleccionada?.data.nombreGasto || '';
    addDoc(collection(this.firestore, 'Gasto'), this.gastoAddModel).then(
      (documentReference: DocumentReference) => {
        console.log(documentReference);

        this.nuevoGastoModal = false;
      }
    );
  }

  getCatXGrupoGasto(grupoCat: String){
    console.log(grupoCat);

    const catQuery = query(
      collection(this.firestore, 'Categoria'),
      where('grupo', '==', grupoCat),
      where('tipoCategoria', '==', 'Gasto'),
      orderBy('orden', 'asc')
    );

    getDocs(catQuery).then((querySnapshot) => {
      this.categoriaModel = querySnapshot.docs.map((doc) => {
        // Aquí, doc.id te dará el ID del documento
        const data = doc.data() as Categoria;
        return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
      });
      console.log(this.categoriaModel);

    });

  }

  onGrupoGastoChange() {
    // Encuentra el objeto en grupoModel que coincide con el valor seleccionado
    const selectedGrupo = this.grupoModel.find(grupo => grupo.id === this.gastoAddModel.grupoGasto);
    console.log(selectedGrupo);
    
    if (selectedGrupo && selectedGrupo.data.hasOwnProperty('grupoCategoria')) {
      // Ahora que tienes el grupo seleccionado, puedes obtener la propiedad grupoCategoria
      const grupoCategoria = selectedGrupo.data.grupoCategoria;
      // Llamas a la función getCatXGrupoGasto con grupoCategoria
      this.getCatXGrupoGasto(grupoCategoria);
    } else{
      this.categoriaModel = [];
    }
  }

  // OBTIENE LOS GASTOS POR ANIO AGRUPADO POR MES Y FILTRADO POR LOS MESES QUE SE REALIZO GASTO
  async getGastosXAnio(vAnio: Number) {
    const gastoQuery = query(
      collection(this.firestore, 'Gasto'),
      where('anioGasto', '==', vAnio.toString())
    );
    const querySnapshot = await getDocs(gastoQuery);
    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map((doc) => doc.data() as Gasto);

    // Filtrar los gastos por el año especificado y aplicar la función getSumByMonth
    const sumByMonth = getSumByMonth(gastos);

    // Actualizar el estado con los gastos filtrados y su suma por mes
    this.sumByMonth = sumByMonth;
  }

  // NUEVO: OBTIENE DETALLE GASTOS POR ANIO Y MES AGRUPADO POR GRUPO
  async getGastosDetalleXMesGrupo(vIndexGrupo: number,vAnio: number, vMes: string) {
    let gastosTodos = this.gruposConGastos[vIndexGrupo].gastos[vAnio][vMes].todos;
    let gastosPorPersona = this.gruposConGastos[vIndexGrupo].gastos[vAnio][vMes].porPersona;

    
    gastosTodos.forEach((gasto: any) => {
      gasto.categoriaGasto
    });
  }


  //OBTIENE LOS GASTOS REALIZADOS ESE MES POR CATEGORIA
  async getGastosDetalleXMes(vAnio: Number, vMes: string) {
    this.anioSeleccionado = '';
    this.mesSeleccionado = '';

    const gastoQuery = query(
      collection(this.firestore, 'Gasto'),
      where('anioGasto', '==', vAnio.toString()),
      where('mesGasto', '==', vMes)
    );
    const querySnapshot = await getDocs(gastoQuery);

    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map((doc) => doc.data() as Gasto);

    // Agrupar y sumar los gastos por categoría
    const sumaPorCategoria = this.catModel.pipe(
      map((categorias) => {
        return categorias.map((cat) => {
          const suma = gastos
            .filter((gasto) => gasto.categoriaGasto === cat.nombreGasto)
            .reduce((acc, curr) => Number(acc) + Number(curr.costo), 0);
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        });
        //.filter(cat => cat.suma > 0); // Filtra las categorías con suma mayor a 0
      })
    );

    // Agrupar y sumar los gastos por categoría de Erick
    const sumaPorCategoriaErick = this.catModel.pipe(
      map((categorias) => {
        return categorias.map((cat) => {
          const suma = gastos
            .filter((gasto) => gasto.categoriaGasto === cat.nombreGasto)
            .reduce(
              (acc, curr) =>
                curr.personGasto == 'Erick'
                  ? Number(acc) + Number(curr.costo)
                  : acc,
              0
            );
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        });
        //.filter(cat => cat.suma > 0); // Filtra las categorías con suma mayor a 0
      })
    );

    // Agrupar y sumar los gastos por categoría de Johana
    const sumaPorCategoriaJohana = this.catModel.pipe(
      map((categorias) => {
        return categorias.map((cat) => {
          const suma = gastos
            .filter((gasto) => gasto.categoriaGasto === cat.nombreGasto)
            .reduce(
              (acc, curr) =>
                curr.personGasto == 'Johana'
                  ? Number(acc) + Number(curr.costo)
                  : acc,
              0
            );
          return { nombreCategoria: cat.nombreGasto, suma: suma };
        });
        //.filter(cat => cat.suma > 0); // Filtra las categorías con suma mayor a 0
      })
    );

    // Actualizar el estado con la suma de gastos por categoría
    sumaPorCategoria.subscribe((resultado) => {
      console.log(resultado);
      this.sumaPorCategoriaList = resultado;
      this.anioSeleccionado = vAnio.toString();
      this.mesSeleccionado = vMes;
      this.pieChartData = {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      };

      // INSERTAR A GRAFICA TODOS
      resultado
        .filter((cat) => cat.suma > 0)
        .map((resultado) => {
          this.pieChartData.labels?.push(resultado.nombreCategoria.toString());
          this.pieChartData.datasets[0].data.push(resultado.suma);
        });
    });

    // Actualizar el estado con la suma de gastos por categoría de ERrick
    sumaPorCategoriaErick.subscribe((resultado) => {
      console.log(resultado);
      this.sumaPorCategoriaListErick = resultado;
      this.pieChartDataErick = {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      };

      // INSERTAR A GRAFICA ERICK
      resultado
        .filter((cat) => cat.suma > 0)
        .map((resultado) => {
          this.pieChartDataErick.labels?.push(
            resultado.nombreCategoria.toString()
          );
          this.pieChartDataErick.datasets[0].data.push(resultado.suma);
        });
    });

    // Actualizar el estado con la suma de gastos por categoría de Johana
    sumaPorCategoriaJohana.subscribe((resultado) => {
      console.log(resultado);
      this.sumaPorCategoriaListJohana = resultado;
      this.pieChartDataJohana = {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      };

      // INSERTAR A GRAFICA JOHANA
      resultado
        .filter((cat) => cat.suma > 0)
        .map((resultado) => {
          this.pieChartDataJohana.labels?.push(
            resultado.nombreCategoria.toString()
          );
          this.pieChartDataJohana.datasets[0].data.push(resultado.suma);
        });
    });
    this.mesXAnioModal = true;
  }

  // OBTIENE EL DETALLE DE LA CATEGORIA SELECCIONADA EN EL MES
  async getDetalleCategoriaXMes(vCategoria: String, vPersona: String) {
    const queryDetTodos = query(
      collection(this.firestore, 'Gasto'),
      where('anioGasto', '==', this.anioSeleccionado.toString()),
      where('mesGasto', '==', this.mesSeleccionado.toString()),
      where('categoriaGasto', '==', vCategoria.toString())
    );
    const gastoQuery =
      vPersona == ''
        ? queryDetTodos
        : query(
            collection(this.firestore, 'Gasto'),
            where('anioGasto', '==', this.anioSeleccionado.toString()),
            where('mesGasto', '==', this.mesSeleccionado.toString()),
            where('categoriaGasto', '==', vCategoria.toString()),
            where('personGasto', '==', vPersona.toString())
          );
    const querySnapshot = await getDocs(gastoQuery);
    // Convertir los documentos a objetos de tipo Gasto
    const gastos = querySnapshot.docs.map((doc) => doc.data() as Gasto);

    this.getDetalleXMes = gastos;
    this.detalleXMesModal = true;
  }
}
