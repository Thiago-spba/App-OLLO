// src/components/RequireVerifiedEmail.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * @fileoverview RequireVerifiedEmail - Guardião Simples
 * * Função única: Verificar se o usuário está logado e verificado.
 * Se não estiver, redireciona. Sem efeitos colaterais.
 */
function RequireVerifiedEmail() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Estado de Carregamento Global (Do Contexto)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#0D4D44] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Carregando OLLO...
          </p>
        </div>
      </div>
    );
  }

  // 2. Não autenticado -> Login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Autenticado mas NÃO Verificado -> Verify Email
  if (!currentUser.emailVerified) {
    // Evita loop se já estivermos na página de verificação (caso raro de uso incorreto do router)
    if (location.pathname === '/verify-email') {
      return <Outlet />;
    }
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // 4. Tudo OK -> Mostra o conteúdo (Feed, Profile, etc)
  return <Outlet />;
}

export default RequireVerifiedEmail;
