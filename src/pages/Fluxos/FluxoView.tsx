import React, { useState, useEffect } from 'react';
import { fluxoService } from '../../services/fluxoApi';
import type { Fluxo } from '../../types/fluxos';
import {
    ArrowLeft, Eye, FileText, Clock, Tag, User,
    ExternalLink, Loader2, AlertCircle, Maximize2
} from 'lucide-react';

interface FluxoViewProps {
    fluxoId: number;
    onVoltar: () => void;
}

const FluxoView: React.FC<FluxoViewProps> = ({ fluxoId, onVoltar }) => {
    const [fluxo, setFluxo] = useState<Fluxo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        loadFluxo(fluxoId);
    }, [fluxoId]);

    const loadFluxo = async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fluxoService.buscarPorId(id);
            setFluxo(data);
        } catch (err) {
            console.error('Erro ao carregar fluxo:', err);
            setError('Erro ao carregar fluxo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusColors = {
        PUBLICADO: 'bg-green-500/20 text-green-400 border-green-500/30',
        RASCUNHO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        ARQUIVADO: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };

    const statusLabels = {
        PUBLICADO: 'Publicado',
        RASCUNHO: 'Rascunho',
        ARQUIVADO: 'Arquivado',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !fluxo) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-3xl mx-auto glass rounded-xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 text-lg">{error || 'Fluxo não encontrado'}</p>
                    <button
                        onClick={onVoltar}
                        className="inline-flex items-center gap-2 mt-4 text-blue-500 hover:text-blue-400"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Dashboard de Fluxos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header do Fluxo */}
            <div className="glass border-b border-gray-200 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <button
                                onClick={onVoltar}
                                className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar ao Dashboard de Fluxos
                            </button>

                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-mono text-gray-500 dark:text-slate-500">{fluxo.codigo}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[fluxo.status]}`}>
                                    {statusLabels[fluxo.status]}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {fluxo.titulo}
                            </h1>

                            <p className="text-gray-600 dark:text-slate-400 max-w-2xl">
                                {fluxo.descricao}
                            </p>
                        </div>

                        <div className="hidden sm:flex flex-col items-end gap-2">
                            <a
                                href={fluxoService.getVisualizarUrl(fluxo.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir em nova aba
                            </a>
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Maximize2 className="w-4 h-4" />
                                Tela cheia
                            </button>
                        </div>
                    </div>

                    {/* Meta informações */}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span>{fluxo.visualizacoes} visualizações</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <FileText className="w-4 h-4" />
                            <span>Versão {fluxo.versaoAtual}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(fluxo.criadoEm)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                            <User className="w-4 h-4" />
                            <span>{fluxo.publicadoPorNome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {fluxo.setorNome}
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    {fluxo.tags && fluxo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {fluxo.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-gray-200 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Iframe com o fluxo */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'h-[calc(100vh-280px)]'}`}>
                {isFullscreen && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="p-2 rounded-lg bg-gray-800/80 text-white hover:bg-gray-700 backdrop-blur"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <iframe
                    src={fluxoService.getVisualizarUrl(fluxo.id)}
                    className="w-full h-full border-0"
                    title={fluxo.titulo}
                />
            </div>
        </div>
    );
};

export default FluxoView;
