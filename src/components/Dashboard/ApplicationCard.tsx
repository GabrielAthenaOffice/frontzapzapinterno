// src/components/Dashboard/ApplicationCard.tsx
import React from 'react';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Application } from '../../types';

interface ApplicationCardProps {
    application: Application;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
    const handleClick = () => {
        if (application.tipo === 'externo' && application.url) {
            window.open(application.url, '_blank');
        } else if (application.onAction) {
            application.onAction();
        }
    };

    const getStatusIcon = () => {
        switch (application.statusColor) {
            case 'green':
                return <CheckCircle size={16} className="text-green-400" />;
            case 'yellow':
                return <Clock size={16} className="text-yellow-400" />;
            case 'red':
                return <AlertCircle size={16} className="text-red-400" />;
            case 'blue':
                return <Clock size={16} className="text-blue-400" />;
            default:
                return null;
        }
    };

    return (
        <button
            onClick={handleClick}
            className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 
                 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 
                 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 hover:-translate-y-1 text-left w-full"
        >
            {/* Icon and Title */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg 
                          flex items-center justify-center text-white group-hover:scale-110 
                          transition-transform duration-300 shadow-lg shadow-blue-500/30">
                        {application.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 
                           transition-colors duration-300">
                            {application.nome}
                        </h3>
                    </div>
                </div>

                {application.tipo === 'externo' && (
                    <ExternalLink size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 
                                             transition-colors duration-300" />
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {application.descricao}
            </p>

            {/* Status */}
            {application.status && (
                <div className="flex items-center space-x-2 text-xs">
                    {getStatusIcon()}
                    <span className="text-gray-600 dark:text-gray-400">{application.status}</span>
                </div>
            )}

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-xl bg-blue-500 dark:bg-blue-400 
                      opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
        </button>
    );
};

export default ApplicationCard;
