import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import EditProfileForm from './EditProfileForm';
import { authService } from '../../services/api';
import { getProfilePhotoUrl } from '../../utils/fileUtils';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUserProfile, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    if (!isOpen || !user) return null;

    const handleUpdate = async (data: Partial<User> & { senha?: string; file?: File }) => {
        try {

            let photoUploaded = false;

            // 1. Upload photo if exists
            if (data.file) {
                const photoResponse = await authService.uploadProfilePhoto(user.id, data.file);
                photoUploaded = true;
                delete data.file; // Remove file from data sent to updateUser
            }

            // 2. Update user info (if name or password changed)
            if (data.nome || data.senha) {
               
                await updateUserProfile(data);
                
            }

            // 3. Refresh user data from server if only photo was uploaded
            if (photoUploaded) {
                
                await refreshUser();
            }

            setIsEditing(false);
        } catch (error) {
            // You might want to show an error message to the user here
            alert('Erro ao atualizar perfil. Por favor, tente novamente depois.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
                </h2>

                {isEditing ? (
                    <EditProfileForm
                        user={user}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-500">
                            {user.fotoPerfil ? (
                                <img
                                    src={getProfilePhotoUrl(user.fotoPerfil)}
                                    alt={user.nome}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl font-bold">
                                    {user.nome.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {user.nome}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                        <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Cargo:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                        >
                            Editar Perfil
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
