import axios from 'axios';
import { LoginData, User, Chat, Mensagem, FileUploadResponse } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: true, // 🔑 Essencial para enviar cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para log de requisições
api.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {

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

    let user = response.data;
    // 🔑 Tenta pegar token de 'token' ou 'jwt'
    let token = response.data.token || response.data.jwt;

    // 🛠️ Tratamento para nova estrutura de resposta: { userDTO: ..., cookie: ... }
    if (response.data.userDTO) {
      user = response.data.userDTO;

      // Tentar extrair token da string do cookie se não vier explícito
      if (!token && response.data.cookie) {
        try {
          // Formato esperado: "nome=valor; Path=/; ..."
          const cookieString = response.data.cookie;
          const firstPart = cookieString.split(';')[0]; // Pega "nome=valor"
          const separatorIndex = firstPart.indexOf('=');
          if (separatorIndex > 0) {
            token = firstPart.substring(separatorIndex + 1);
          }
        } catch (e) {
          console.error('Erro ao extrair token do cookie:', e);
        }
      }
    }

    // 🔑 Salvar token JWT no localStorage para uso no fluxoApi
    if (token) {
      localStorage.setItem('athena-jwt-token', token);
    }

    return user;
  },

  logout: async () => {
    // 🔑 Remover token JWT do localStorage
    localStorage.removeItem('athena-jwt-token');

    const response = await api.post('/auth/singout');

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/user');
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User> & { senha?: string }) => {
    const response = await api.put<User>(`/auth/${id}`, data);
    return response.data;
  },

  uploadProfilePhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ url: string }>(`/auth/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
  },

  deletarChat: async (chatId: number) => {
    const response = await api.delete<Chat>(`/api/chats/${chatId}`);
    return response.data;
  }
};

// ===== MENSAGEM ENDPOINTS =====
export const mensagemService = {
  listarMensagens: async (chatId: number, page = 0, size = 50) => {
    const response = await api.get<Mensagem[]>(
      `/api/mensagens/chat/${chatId}`,
      { params: { page, size } }
    );
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

// ===== FILE ENDPOINTS =====
export const fileService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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