import { UserRole } from "./permissions";

// src/types/index.ts
export interface User {
  role: UserRole;
  id: number;
  nome: string;
  email: string;
  fotoPerfil?: string;
}

export interface Chat {
  id: number;
  nome: string;
  tipo: 'PRIVADO' | 'GRUPO';
  participantes: User[];
  criadoEm: string;
  groupId?: number; // ID do grupo se for chat de grupo
}

export interface Anexo {
  id: number;
  nomeArquivo: string;
  tipoMime: string;
  tamanhoBytes: number;
  urlPublica: string;
  caminhoSupabase: string;
}

export interface Mensagem {
  id: number;
  chatId: number;
  remetenteId: number;
  remetenteNome: string;
  conteudo: string;
  enviadoEm: string;
  lida: boolean;
  anexos?: Anexo[];
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface ChatListItem extends Chat {
  ultimaMensagem?: string;
  horaUltimaMensagem?: string;
  ultimoConteudo?: string; // Do ChatResumoDTO
  ultimaMensagemEm?: string; // Do ChatResumoDTO
  outroUsuario?: string; // Do ChatResumoDTO - nome do outro usuário em chat privado
  quantidadeNaoLidas?: number; // Do ChatResumoDTO - quantidade de mensagens não lidas
  groupId?: number; // Do ChatResumoDTO - ID do grupo para operações
}

export interface Notificacao {
  chatId: number;
  chatNome: string;
  conteudoResumo: string;
  enviadoEm: string; // vem como ISO do back
}

export interface Application {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  tipo: 'interno' | 'externo';
  url?: string; // Para aplicações externas
  onAction?: () => void; // Para aplicações internas
  status?: string;
  statusColor?: 'green' | 'yellow' | 'red' | 'blue';
}
