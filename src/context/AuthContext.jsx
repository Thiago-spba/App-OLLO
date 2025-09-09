// ARQUIVO CORRIGIDO: src/context/AuthContext.jsx
// Versão sem conflitos de importação

import React, { createContext, useContext, useMemo } from 'react';
import useAuthLogic from '../hooks/useAuth'; // Hook com a lógica

const AuthContext = createContext(null);

// Exportar o hook do contexto com nome diferente para evitar conflito
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Usar o hook de lógica
  const authLogic = useAuthLogic();

  // Memorizar o valor do contexto para evitar re-renders desnecessários
  const value = useMemo(
    () => ({
      ...authLogic,
      // Adicionar propriedades computadas úteis
      isAuthenticated: !!authLogic.currentUser,
      isEmailVerified: authLogic.currentUser?.emailVerified || false,
      hasUsername: !!authLogic.currentUser?.username,
      needsProfileSetup:
        authLogic.currentUser && !authLogic.currentUser?.username,
    }),
    [authLogic, authLogic.currentUser]
  );

  // Renderizar loading enquanto verifica autenticação
  if (authLogic.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-ollo-accent-light border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
