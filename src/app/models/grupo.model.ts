export interface Grupo {
  codigoUnico: number;
  nombreGrupo: String;
  integrantes: IntegrantesGrupo[]
  uidCreador: String;
}

export interface IntegrantesGrupo {
  uidIntegrante: String;
  nombreIntegrante: String;
}
