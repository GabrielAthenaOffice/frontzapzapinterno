import React, { useState, useEffect } from 'react';
import { fluxoService } from '../../services/fluxoApi';
import type { Fluxo, PageResponse } from '../../types/fluxos';
import FluxoCard from '../../components/Fluxos/FluxoCard';
import { Plus, Filter, ChevronLeft, ChevronRight, Loader2, LayoutGrid, ArrowLeft } from 'lucide-react';

interface FluxosDashboardProps {
    onNavigateToFluxo: (fluxoId: number) => void;
    onNavigateToPublicar: () => void;
    onVoltar: () => void;
}

const FluxosDashboard: React.FC<FluxosDashboardProps> = ({
    onNavigateToFluxo,
    onNavigateToPublicar,
    onVoltar
}) => {
    const [fluxos, setFluxos] = useState<Fluxo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        loadFluxos();
    }, [page, statusFilter]);

    const loadFluxos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response: PageResponse<Fluxo> = await fluxoService.listar({
                page,
                size: 9,
                status: statusFilter || undefined,
            });
            setFluxos(response.content);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error('Erro ao carregar fluxos:', err);
            setError('Erro ao carregar fluxos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={onVoltar}
                            className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <LayoutGrid className="w-8 h-8 text-blue-500" />
                            Dashboard de Fluxos
                        </h1>
                        <p className="text-gray-600 dark:text-slate-400 mt-1">
                            Visualize e gerencie todos os fluxos de processos
                        </p>
                    </div>

                    <button
                        onClick={onNavigateToPublicar}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 
                            text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all
                            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                        <Plus className="w-5 h-5" />
                        Publicar Fluxo
                    </button>
                </div>

                {/* Filters */}
                <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filtrar:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: '', label: 'Todos' },
                            { value: 'PUBLICADO', label: 'Publicados' },
                            { value: 'RASCUNHO', label: 'Rascunhos' },
                            { value: 'ARQUIVADO', label: 'Arquivados' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setStatusFilter(option.value);
                                    setPage(0);
                                }}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${statusFilter === option.value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="glass rounded-xl p-8 text-center">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={loadFluxos}
                            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : fluxos.length === 0 ? (
                    <div className="glass rounded-xl p-12 text-center">
                        <LayoutGrid className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Nenhum fluxo encontrado
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 mb-6">
                            Comece publicando seu primeiro fluxo de processo.
                        </p>
                        <button
                            onClick={onNavigateToPublicar}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600"
                        >
                            <Plus className="w-5 h-5" />
                            Publicar Fluxo
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Grid de Fluxos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {fluxos.map((fluxo) => (
                                <FluxoCard
                                    key={fluxo.id}
                                    fluxo={fluxo}
                                    onClick={() => onNavigateToFluxo(fluxo.id)}
                                />
                            ))}
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <span className="px-4 py-2 text-gray-600 dark:text-slate-400">
                                    Página {page + 1} de {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-slate-600"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FluxosDashboard;
