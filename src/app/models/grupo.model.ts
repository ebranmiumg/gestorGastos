export interface Grupo {
  codigoUnico: String;
  nombreGrupo: String;
  integrantes: IntegrantesGrupo[]
  uidCreador: string | null;
}

export interface IntegrantesGrupo {
  uidIntegrante: string | null;
  nombreIntegrante: string | null;
}
