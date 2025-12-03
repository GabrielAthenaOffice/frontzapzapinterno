import React, { useState, useRef } from 'react';
import { User } from '../../types';

interface EditProfileFormProps {
    user: User;
    onSubmit: (data: Partial<User> & { senha?: string; file?: File }) => Promise<void>;
    onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit, onCancel }) => {
    const [nome, setNome] = useState(user.nome);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.fotoPerfil || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (senha && senha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            const data: any = { nome };
            if (senha) data.senha = senha;
            if (selectedFile) data.file = selectedFile;

            await onSubmit(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            <div className="flex flex-col items-center mb-4">
                <div
                    className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-blue-500 cursor-pointer relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                            {user.nome.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-bold">Alterar</span>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Alterar foto
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome
                </label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha (opcional)
                </label>
                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Deixe em branco para manter a atual"
                />
            </div>

            {senha && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmar Nova Senha
                    </label>
                    <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                </div>
            )}

            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

export default EditProfileForm;
