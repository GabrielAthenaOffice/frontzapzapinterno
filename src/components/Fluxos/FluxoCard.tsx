import React from 'react';
import { Eye, FileText, Clock, Tag, ChevronRight } from 'lucide-react';
import type { Fluxo } from '../../types/fluxos';

interface FluxoCardProps {
    fluxo: Fluxo;
    onClick: () => void;
}

const FluxoCard: React.FC<FluxoCardProps> = ({ fluxo, onClick }) => {
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <button
            onClick={onClick}
            className="group block w-full text-left glass rounded-2xl p-6 card-hover"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{fluxo.codigo}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[fluxo.status]}`}>
                            {statusLabels[fluxo.status]}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {fluxo.titulo}
                    </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-4">
                {fluxo.descricao || 'Sem descrição disponível'}
            </p>

            {/* Tags */}
            {fluxo.tags && fluxo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {fluxo.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 flex items-center gap-1"
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                    {fluxo.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-slate-500">
                            +{fluxo.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700/50">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {fluxo.visualizacoes}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        v{fluxo.versaoAtual}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(fluxo.criadoEm)}
                    </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {fluxo.setorNome}
                </span>
            </div>
        </button>
    );
};

export default FluxoCard;
