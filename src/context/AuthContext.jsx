// src/context/AuthContext.jsx
// ARQUIVO FINAL: Unifica a lógica de `useAuthLogic` com a praticidade do Context API.
// Esta é agora a ÚNICA fonte da verdade para autenticação na OLLO.

import React, { createContext, useContext, useMemo } from 'react';
// CORREÇÃO: Apontando para o arquivo correto do nosso hook de lógica.
import useAuthLogic from '../hooks/useAuthLogic';

const AuthContext = createContext(null);

// Hook que os componentes usarão para acessar os dados de autenticação.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provedor que encapsula a aplicação e disponibiliza o contexto.
export const AuthProvider = ({ children }) => {
  // 1. Toda a lógica complexa é encapsulada aqui.
  const authLogic = useAuthLogic();

  // 2. O valor do contexto é memorizado para otimização de performance.
  const value = useMemo(
    () => ({
      // Espalha todos os retornos do nosso hook de lógica (currentUser, login, logout, etc.)
      ...authLogic,
      // Adiciona propriedades computadas para facilitar o uso nos componentes.
      isAuthenticated: !!authLogic.currentUser,
      isEmailVerified: authLogic.currentUser?.emailVerified || false,
      hasUsername: !!authLogic.currentUser?.username,
      // Útil para direcionar o usuário para a tela de criação de perfil.
      needsProfileSetup:
        authLogic.currentUser && !authLogic.currentUser?.username,
    }),
    // CORREÇÃO: A dependência `authLogic.currentUser` é redundante.
    // O objeto `authLogic` já muda quando `currentUser` muda, então apenas `authLogic` é suficiente.
    [authLogic]
  );

  // 3. Mostra um loading global enquanto o estado inicial de auth é resolvido.
  if (authLogic.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-ollo-primary border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  // 4. Fornece o valor para todos os componentes filhos.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
