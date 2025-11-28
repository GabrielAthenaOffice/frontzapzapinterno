// src/types/index.ts
export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface Chat {
  id: number;
  nome: string;
  tipo: 'PRIVADO' | 'GRUPO';
  participantes: User[];
  criadoEm: string;
  groupId?: number; // ID do grupo se for chat de grupo
}

export interface Mensagem {
  id: number;
  chatId: number;
  remetenteId: number;
  remetenteNome: string;
  conteudo: string;
  enviadoEm: string;
  lida: boolean;
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
