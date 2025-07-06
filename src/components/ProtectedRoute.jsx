// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * @fileoverview ProtectedRoute - Guardião de Login Padrão OLLO.
 *
 * @description
 * Este componente protege rotas que exigem apenas que o usuário esteja logado.
 *
 * @architecture
 * 1. Lê `currentUser` e `loading` do AuthContext.
 * 2. **A CORREÇÃO CRUCIAL:** Se `loading` for `true`, ele retorna `null`. Isso faz com
 *    que o guardião espere o AuthContext terminar sua verificação inicial sem
 *    renderizar nada na tela e sem quebrar o layout.
 * 3. Apenas quando `loading` for `false`, ele verifica se `currentUser` existe.
 * 4. Se não houver usuário, redireciona para o login.
 * 5. Se houver usuário, renderiza a rota filha (seja via `children` ou `<Outlet />`).
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Espera o AuthContext terminar sua verificação.
  // O loader de tela cheia do AuthProvider já está visível para o usuário.
  if (loading) {
    return null;
  }

  // 2. Após o carregamento, toma a decisão.
  if (!currentUser) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ redirectedFrom: location.pathname }}
      />
    );
  }

  // 3. Se o usuário existe, renderiza o conteúdo protegido.
  // Suporta tanto `children` (para envolver um único componente)
  // quanto `<Outlet />` (para ser usado como um layout de rota).
  return children ? children : <Outlet />;
}
