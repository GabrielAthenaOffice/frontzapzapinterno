import axios from 'axios';
import type { Fluxo, FluxoCreateDTO, PageResponse, Arquivo, Setor } from '../types/fluxos';

// API de Fluxos - Backend separado
const FLUXOS_API_URL = process.env.REACT_APP_FLUXOS_API_URL || 'https://fluxosdaathenaoffice.onrender.com';

const fluxoApi = axios.create({
    baseURL: FLUXOS_API_URL,
    withCredentials: true,
});

// Função auxiliar para decodificar JWT manualmente sem bibliotecas extras
const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// 🔑 Interceptor para adicionar token JWT no header Authorization
fluxoApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('athena-jwt-token');
        console.log(`🔍 [FluxoApi] Request para: ${config.baseURL}${config.url}`);

        if (token) {
            console.log('✅ [FluxoApi] Token encontrado. Inicio:', token.substring(0, 10) + '...');

            // Log do payload para debug
            const payload = parseJwt(token);
            console.log('🔍 [FluxoApi] Payload do Token:', payload);

            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ [FluxoApi] Nenhum token encontrado no localStorage!');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para log de erros
fluxoApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ Erro na API de Fluxos:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

// ==================== FLUXOS ====================

export const fluxoService = {
    // Listar fluxos com paginação e filtros
    listar: async (params?: {
        setor?: string;
        status?: string;
        busca?: string;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Fluxo>> => {
        const response = await fluxoApi.get('/api/fluxos', { params });
        return response.data;
    },

    // Buscar fluxo por ID
    buscarPorId: async (id: number): Promise<Fluxo> => {
        const response = await fluxoApi.get(`/api/fluxos/${id}`);
        return response.data;
    },

    // Publicar novo fluxo
    publicar: async (fluxo: FluxoCreateDTO, arquivo?: File): Promise<Fluxo> => {
        const formData = new FormData();
        formData.append('fluxo', new Blob([JSON.stringify(fluxo)], { type: 'application/json' }));

        if (arquivo) {
            formData.append('arquivo', arquivo);
        }

        const response = await fluxoApi.post('/api/fluxos', formData);
        return response.data;
    },

    // Atualizar status do fluxo
    atualizarStatus: async (id: number, status: string): Promise<Fluxo> => {
        const response = await fluxoApi.patch(`/api/fluxos/${id}/status`, null, {
            params: { status },
        });
        return response.data;
    },

    // Publicar nova versão
    publicarNovaVersao: async (id: number, arquivo: File, observacoes?: string): Promise<Fluxo> => {
        const formData = new FormData();
        formData.append('arquivo', arquivo);

        const response = await fluxoApi.post(`/api/fluxos/${id}/versoes`, formData, {
            params: { observacoes },
        });
        return response.data;
    },

    // Deletar fluxo
    deletar: async (id: number): Promise<void> => {
        await fluxoApi.delete(`/api/fluxos/${id}`);
    },

    // URL para visualização do fluxo
    getVisualizarUrl: (id: number, versao?: number): string => {
        const baseUrl = `${FLUXOS_API_URL}/api/fluxos/${id}/visualizar`;
        return versao ? `${baseUrl}?versao=${versao}` : baseUrl;
    },
};

// ==================== ARQUIVOS ====================

export const arquivoService = {
    // Listar arquivos de uma versão
    listarPorVersao: async (fluxoId: number, versaoId: number): Promise<Arquivo[]> => {
        const response = await fluxoApi.get(`/api/fluxos/${fluxoId}/versoes/${versaoId}/arquivos`);
        return response.data;
    },

    // Obter URL assinada de um arquivo
    getUrl: async (id: number): Promise<{ url: string }> => {
        const response = await fluxoApi.get(`/api/arquivos/${id}`);
        return response.data;
    },

    // URL para download direto
    getDownloadUrl: (id: number): string => {
        return `${FLUXOS_API_URL}/api/arquivos/${id}/download`;
    },

    // URL para visualização do arquivo HTML
    getVisualizarUrl: (id: number): string => {
        return `${FLUXOS_API_URL}/api/arquivos/${id}/visualizar`;
    },
};

// ==================== SETORES ====================

export const setorService = {
    listar: async (): Promise<Setor[]> => {
        const response = await fluxoApi.get('/api/setores');
        return response.data;
    },
};

export default fluxoApi;
