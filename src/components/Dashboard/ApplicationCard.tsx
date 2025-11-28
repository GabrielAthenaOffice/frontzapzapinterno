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
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 
                 border border-gray-700 hover:border-purple-500 transition-all duration-300 
                 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 text-left w-full"
        >
            {/* Icon and Title */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg 
                          flex items-center justify-center text-white group-hover:scale-110 
                          transition-transform duration-300">
                        {application.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 
                           transition-colors duration-300">
                            {application.nome}
                        </h3>
                    </div>
                </div>

                {application.tipo === 'externo' && (
                    <ExternalLink size={18} className="text-gray-400 group-hover:text-purple-400 
                                             transition-colors duration-300" />
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {application.descricao}
            </p>

            {/* Status */}
            {application.status && (
                <div className="flex items-center space-x-2 text-xs">
                    {getStatusIcon()}
                    <span className="text-gray-400">{application.status}</span>
                </div>
            )}

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 
                      opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
        </button>
    );
};

export default ApplicationCard;
