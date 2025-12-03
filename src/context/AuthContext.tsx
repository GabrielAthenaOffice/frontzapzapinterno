// athena-chat/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {

      // Garantir que o user é null se não autenticado
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {

      const user = await authService.login(data);


      if (!user || !user.id) {
        throw new Error('Resposta do servidor inválida - usuário sem ID');
      }

      setUser(user);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
      console.error('❌ Erro no login:', errorMessage);
      console.error('Detalhes do erro:', error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};