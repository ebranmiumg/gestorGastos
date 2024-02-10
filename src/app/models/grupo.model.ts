export interface Grupo {
  codigoUnico: String;
  nombreGrupo: String;
  integrantes: IntegrantesGrupo[];
  uidCreador: string | null;
  grupoCategoria: String;
}

export interface IntegrantesGrupo {
  uidIntegrante: string | null;
  nombreIntegrante: string | null;
}
