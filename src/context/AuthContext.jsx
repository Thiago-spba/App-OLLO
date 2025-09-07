// ARQUIVO COMPLETO E CORRETO PARA: src/context/AuthContext.jsx
import React, { createContext, useContext, useMemo } from 'react';
import useAuthLogic from '../hooks/useAuth'; // MUDANÇA: Importando o nosso novo hook de lógica

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // CORREÇÃO: Usando o novo hook que criamos para obter toda a lógica
  const authLogic = useAuthLogic();

  // CORREÇÃO: Usamos useMemo para garantir que o objeto 'value' só seja recriado se os valores mudarem
  const value = useMemo(
    () => ({
      ...authLogic, // Espalha todos os valores retornados pelo hook
      isAuthenticated: !!authLogic.currentUser,
      isEmailVerified: authLogic.currentUser?.emailVerified || false,
    }),
    [authLogic]
  );

  return (
    <AuthContext.Provider value={value}>
      {' '}
      {!authLogic.loading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-ollo-accent-light border-t-transparent rounded-full animate-spin" />
        </div>
      )}{' '}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
