export interface Presupuesto {
  personaPresupuesto: String;
  anioPresupuesto: String;
  mesPresupuesto: String;
  categoriaPresupuesto: String;
  descripcionPresupuesto: String;
  monto: number;
  elementosPresupuesto: ElementoPresupuesto[];
}

export interface ElementoPresupuesto {
  nombreElemento: String;
  montoElemento:number;
}
