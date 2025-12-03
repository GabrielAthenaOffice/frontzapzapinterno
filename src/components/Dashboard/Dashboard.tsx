// src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { MessageCircle, LogOut, ExternalLink, Users, FileText, BarChart3, Moon, Sun, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application } from '../../types';
import { Permission } from '../../types/permissions';
import ApplicationCard from './ApplicationCard';
import RoleBadge from '../common/RoleBadge';
import ProtectedAction from '../common/ProtectedAction';
import UserRegistrationForm from '../Admin/UserRegistrationForm';
import ProfileModal from '../Profile/ProfileModal';

interface DashboardProps {
    onNavigateToChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToChat }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showRegisterModal, setShowRegisterModal] = React.useState(false);
    const [showProfileModal, setShowProfileModal] = React.useState(false);

    // 🐛 DEBUG: Log user data para verificar fotoPerfil
    React.useEffect(() => {
        console.log('👤 Dashboard - Current user:', user);
        console.log('📸 Dashboard - FotoPerfil URL:', user?.fotoPerfil);
    }, [user]);

    const applications: Application[] = [
        {
            id: 'chat',
            nome: 'Chat Interno',
            descricao: 'Sistema de mensagens corporativo em tempo real para comunicação entre equipes',
            icon: <MessageCircle size={24} />,
            tipo: 'interno',
            onAction: onNavigateToChat,
            status: 'Online',
            statusColor: 'green'
        },
        {
            id: 'app-athena',
            nome: 'App Athena',
            descricao: 'Aplicação principal para atividades comerciais',
            icon: <ExternalLink size={24} />,
            tipo: 'externo',
            url: 'https://app.athenaoffice.com.br',
            status: 'Em Produção',
            statusColor: 'green'
        },
        {
            id: 'correspondencias',
            nome: 'Correspondências',
            descricao: 'Portal de correspondências',
            icon: <Users size={24} />,
            tipo: 'externo',
            url: 'https://front-correspondencias-athena-d9yx.vercel.app/',
            status: 'Em Produção',
            statusColor: 'green'
        },
        {
            id: 'documentacao',
            nome: 'Documentação',
            descricao: 'Central de documentação e recursos técnicos',
            icon: <FileText size={24} />,
            tipo: 'externo',
            url: '#', // Substituir pelo link real
            status: 'Beta',
            statusColor: 'yellow'
        },
        {
            id: 'analytics',
            nome: 'Analytics',
            descricao: 'Dashboard de métricas e análises de dados',
            icon: <BarChart3 size={24} />,
            tipo: 'externo',
            url: '#', // Substituir pelo link real
            status: 'Beta',
            statusColor: 'yellow'
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                            <img
                                src="/logo principal site.png"
                                alt="Athena Logo"
                                className="h-12 object-contain"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Athena Office</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Central de Aplicações</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            <div
                                className="text-right cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setShowProfileModal(true)}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.nome}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                                {user?.role && (
                                    <div className="mt-1 flex justify-end">
                                        <RoleBadge role={user.role} size="sm" showIcon />
                                    </div>
                                )}
                            </div>
                            <div
                                className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                                onClick={() => setShowProfileModal(true)}
                            >
                                {user?.fotoPerfil ? (
                                    <img src={user.fotoPerfil} alt={user.nome} className="w-full h-full object-cover" />
                                ) : (
                                    user?.nome.charAt(0).toUpperCase()
                                )}
                            </div>
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>

                            {/* Register User Button (Protected) */}
                            <ProtectedAction permission={Permission.USER_CREATE}>
                                <button
                                    onClick={() => setShowRegisterModal(true)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                                    title="Registrar Novo Usuário"
                                >
                                    <UserPlus size={20} />
                                </button>
                            </ProtectedAction>

                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 
                           hover:text-red-600 dark:hover:text-red-400"
                                title="Sair"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Bem-vindo, {user?.nome.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Selecione um dos programas abaixo
                    </p>
                </div>

                {/* Applications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <ApplicationCard key={app.id} application={app} />
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © 2024 Athena Office. Todos os direitos reservados.
                    </p>
                </div>
            </main>

            <UserRegistrationForm
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSuccess={() => {
                    // Opcional: recarregar dados ou mostrar notificação

                }}
            />

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default Dashboard;
