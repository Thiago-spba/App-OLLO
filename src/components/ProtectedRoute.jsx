// ARQUIVO COMPLETO: src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Componente de rota protegida.
 * Requer que o usuário esteja autenticado E com o e-mail verificado para acessar as rotas filhas.
 */
export default function ProtectedRoute({ children }) {
  // MUDANÇA: Consumindo as propriedades refatoradas do nosso hook.
  const { isAuthenticated, isEmailVerified, loading } = useAuth();
  const location = useLocation();

  // Espera o estado inicial de carregamento do AuthContext
  if (loading) {
    // O spinner já é exibido pelo AuthProvider, então retornamos null para evitar renderização
    // de tela branca ou piscar.
    return null;
  }

  // CORREÇÃO: Lógica de redirecionamento em ordem de prioridade

  // 1. Se o usuário não está autenticado, redireciona para a página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Se o usuário está autenticado, mas o e-mail não está verificado, redireciona
  // para a página de verificação de e-mail. Isso garante que o usuário não acesse
  // o conteúdo protegido sem a confirmação.
  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  // 3. Se todas as verificações passarem, permite o acesso ao conteúdo protegido.
  return children || <Outlet />;
}
