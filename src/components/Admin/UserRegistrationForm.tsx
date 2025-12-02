import React, { useState } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { authService } from '../../services/api';
import { UserRole, roleLabelMap } from '../../types/permissions';

interface UserRegistrationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        cargo: '',
        role: UserRole.FUNCIONARIO // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log('📝 Registrando usuário:', formData);
            await authService.register(formData);
            console.log('✅ Usuário registrado com sucesso');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                nome: '',
                email: '',
                senha: '',
                cargo: '',
                role: UserRole.FUNCIONARIO
            });
        } catch (err: any) {
            console.error('Erro ao registrar usuário:', err);
            setError(err.response?.data?.message || 'Erro ao registrar usuário. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <UserPlus size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Usuário</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2 text-red-700 dark:text-red-300 text-sm">
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Ex: Edjenes"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            E-mail
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="juan.carlito@athena.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cargo
                        </label>
                        <input
                            type="text"
                            name="cargo"
                            value={formData.cargo}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Ex: Marketing, Financeiro, Correspondência"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Senha Inicial
                        </label>
                        <input
                            type="password"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nível de Acesso (Role)
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                    {roleLabelMap[role]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <span>Registrando...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Registrar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRegistrationForm;
