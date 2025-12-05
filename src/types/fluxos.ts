// Tipos para o módulo de Fluxos (Bizagi)

export interface Setor {
  codigo: string;
  nome: string;
  descricao?: string;
}

export interface Fluxo {
  id: number;
  titulo: string;
  descricao: string;
  codigo: string;
  status: StatusFluxo;
  setorNome: string;
  setorCodigo: string;
  publicadoPorNome: string;
  versaoAtual: number;
  visualizacoes: number;
  tags: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export type StatusFluxo = 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';

export interface FluxoCreateDTO {
  titulo: string;
  descricao: string;
  codigoSetor: string;
  tags: string[];
}

export interface Arquivo {
  id: number;
  nome: string;
  tipo: TipoArquivo;
  mimeType: string;
  tamanho: number;
  url: string;
}

export type TipoArquivo = 'HTML' | 'CSS' | 'JAVASCRIPT' | 'IMAGEM' | 'PDF' | 'OUTRO';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
