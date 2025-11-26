import axios from 'axios';
import { LoginData, User, Chat, Mensagem } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 🔑 Essencial para enviar cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para log de requisições
api.interceptors.request.use(
  (config) => {
    console.log('📤 Requisição:', config.method?.toUpperCase(), config.url);
    console.log('🍪 Cookies sendo enviados:', document.cookie);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log('📥 Resposta bem-sucedida:', response.status, response.config.url);
    console.log('🍪 Cookies após resposta:', document.cookie);
    return response;
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // ⚠️ NÃO redirecionar automaticamente aqui
    // Deixar o componente lidar com 401/403
    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====
export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post<any>('/auth/login', data);
    
    console.log('📦 Resposta completa do login:', response);
    console.log('📦 response.data:', response.data);
    console.log('📦 response.headers:', response.headers);
    console.log('🍪 Cookies após login:', document.cookie);
    
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/singout');
    console.log('🗑️ Logout realizado');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/user');
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  }
};

// ===== CHAT ENDPOINTS =====
export const chatService = {
  listarMeusChats: async () => {
    const response = await api.get<any[]>('/api/chats/meus-chats');
    return response.data;
  },

  buscarChatPorId: async (chatId: number) => {
    const response = await api.get<Chat>(`/api/chats/${chatId}`);
    return response.data;
  },

  criarChatPrivado: async (usuarioDestinoId: number) => {
    const response = await api.post<Chat>(
      `/api/chats/privado?usuarioDestinoId=${usuarioDestinoId}`
    );
    return response.data;
  },

  criarGrupoChat: async (nome: string, usuariosIds: number[]) => {
    const response = await api.post<any>('/api/grupos', {
      nome,
      descricao: '', // Descrição vazia por padrão
      usuariosIds // 🔑 Lista de IDs dos usuários
    });
    return response.data;
  }
};

// ===== MENSAGEM ENDPOINTS =====
export const mensagemService = {
  listarMensagens: async (chatId: number, page = 0, size = 100) => {
    const response = await api.get<Mensagem[]>(`/api/mensagens/chat/${chatId}`, {
      params: { page, size },
    });
    return response.data;
  },

  enviarMensagem: async (mensagem: Partial<Mensagem>) => {
    const response = await api.post<Mensagem>('/api/mensagens', mensagem);
    return response.data;
  },

  marcarComoLida: async (mensagemId: number) => {
    const response = await api.put(`/api/mensagens/${mensagemId}/lida`);
    return response.data;
  }
};

// ===== USER ENDPOINTS =====
export const userService = {
  listarUsuarios: async () => {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  buscarUsuarioPorId: async (userId: number) => {
    const response = await api.get<User>(`/api/users/${userId}`);
    return response.data;
  }
};

// ===== GROUP ENDPOINTS =====
export const groupService = {
  listarGrupos: async () => {
    const response = await api.get('/api/grupos');
    return response.data;
  },

  buscarGrupo: async (groupId: number) => {
    const response = await api.get(`/api/grupos/${groupId}`);
    return response.data;
  },

  criarGrupo: async (data: any) => {
    const response = await api.post('/api/grupos', data);
    return response.data;
  },

  atualizarGrupo: async (groupId: number, data: any) => {
    const response = await api.put(`/api/grupos/${groupId}`, data);
    return response.data;
  },

  listarUsuariosDisponiveis: async (groupId: number) => {
    const response = await api.get(`/api/grupos/${groupId}/usuarios-disponiveis`);
    return response.data;
  },

  adicionarUsuario: async (groupId: number, userId: number) => {
    const response = await api.post(`/api/grupos/${groupId}/usuarios/${userId}`);
    return response.data;
  },

  removerUsuario: async (groupId: number, userId: number) => {
    const response = await api.delete(`/api/grupos/${groupId}/usuarios/${userId}`);
    return response.data;
  },

  deletarGrupo: async (groupId: number) => {
    const response = await api.delete(`/api/grupos/${groupId}`);
    return response.data;
  }
};

export default api;