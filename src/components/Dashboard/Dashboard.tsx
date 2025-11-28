// src/components/Dashboard/Dashboard.tsx
import React from 'react';
import { MessageCircle, LogOut, ExternalLink, Users, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';
import ApplicationCard from './ApplicationCard';

interface DashboardProps {
    onNavigateToChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToChat }) => {
    const { user, logout } = useAuth();

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
            url: 'https://front-correspondencias-athena-d9yx.vercel.app/', // Substituir pelo link real
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white shadow-sm">
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
                                <h1 className="text-2xl font-bold text-gray-900">Athena Office</h1>
                                <p className="text-sm text-gray-600">Central de Aplicações</p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
                                <p className="text-xs text-gray-600">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-600 
                              rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.nome.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 
                           hover:text-red-600"
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo, {user?.nome.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600">
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
                    <p className="text-sm text-gray-500">
                        © 2024 Athena Office. Todos os direitos reservados.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
