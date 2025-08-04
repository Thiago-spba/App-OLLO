// src/components/ProtectedRoute.jsx
// Guardião de Login OLLO — Protege rotas autenticadas, robusto, pronto para expansão.

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Componente de rota protegida.
 * Só permite acesso se o usuário estiver autenticado (currentUser não é null).
 * Mostra loader padrão OLLO (do AuthProvider) durante loading inicial.
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Espera a verificação inicial (loader já renderiza via AuthProvider)
  if (loading) return null;

  // Se não logado, redireciona para login (guarda origem para pós-login)
  if (!currentUser) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ redirectedFrom: location.pathname }}
      />
    );
  }

  // Se logado, renderiza conteúdo protegido
  return children || <Outlet />;
}
