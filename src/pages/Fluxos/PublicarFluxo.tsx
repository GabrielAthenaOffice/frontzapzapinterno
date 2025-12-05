import React, { useState } from 'react';
import { fluxoService } from '../../services/fluxoApi';
import type { FluxoCreateDTO } from '../../types/fluxos';
import FileUpload from '../../components/Fluxos/FileUpload';
import {
    Upload, ArrowLeft, Tag, X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

interface PublicarFluxoProps {
    onVoltar: () => void;
    onSuccess: () => void;
}

const PublicarFluxo: React.FC<PublicarFluxoProps> = ({ onVoltar, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [codigoSetor, setCodigoSetor] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);

    // Setores - você pode buscar da API depois
    const setores = [
        { codigo: 'TI', nome: 'Tecnologia da Informação' },
        { codigo: 'RH', nome: 'Recursos Humanos' },
        { codigo: 'FIN', nome: 'Financeiro' },
        { codigo: 'COM', nome: 'Comercial' },
        { codigo: 'OP', nome: 'Operações' },
    ];

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dto: FluxoCreateDTO = {
                titulo,
                descricao,
                codigoSetor,
                tags,
            };

            await fluxoService.publicar(dto, arquivo || undefined);
            setSuccess(true);

            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: any) {
            console.error('Erro ao publicar:', err);
            setError(err.response?.data?.message || 'Erro ao publicar fluxo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
                <div className="glass rounded-2xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fluxo Publicado!</h2>
                    <p className="text-gray-500 dark:text-slate-400">Redirecionando para o dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onVoltar}
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Upload className="w-8 h-8 text-blue-500" />
                        Publicar Fluxo
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400 mt-1">
                        Faça upload de um fluxo de processo do Bizagi
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                            placeholder="Ex: Processo de Admissão de Funcionários"
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 
                                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            rows={4}
                            placeholder="Descreva o fluxo de processo..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 
                                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                        />
                    </div>

                    {/* Setor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Setor *
                        </label>
                        <select
                            value={codigoSetor}
                            onChange={(e) => setCodigoSetor(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 
                                text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 
                                focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">Selecione o setor</option>
                            {setores.map((setor) => (
                                <option key={setor.codigo} value={setor.codigo}>
                                    {setor.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Digite uma tag e pressione Enter"
                                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 
                                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 
                                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Tag className="w-4 h-4" />
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-blue-800 dark:hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload de Arquivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Arquivo ZIP do Bizagi
                        </label>
                        <FileUpload
                            onFileSelect={setArquivo}
                            accept=".zip"
                            maxSize={100}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !titulo || !codigoSetor}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 
                            text-white font-semibold hover:from-blue-600 hover:to-purple-700 
                            transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Publicar Fluxo
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PublicarFluxo;
