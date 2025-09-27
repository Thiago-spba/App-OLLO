// src/components/ProtectedRoute.jsx
// COMPONENTE DE ROTA PROTEGIDA - VERSÃO FINAL

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Componente de rota protegida.
 * Requer que o usuário esteja autenticado E com o e-mail verificado.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Aguarda o carregamento do estado de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Se não há usuário autenticado, redireciona para login
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Se o usuário existe mas email não verificado, redireciona para verificação
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  // 3. Se tudo está ok, permite acesso ao conteúdo protegido
  return children || <Outlet />;
}

