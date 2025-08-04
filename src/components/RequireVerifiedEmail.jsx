// src/components/RequireVerifiedEmail.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * @fileoverview RequireVerifiedEmail - Guardião de Verificação Padrão OLLO.
 *
 * @description
 * Este componente protege rotas que exigem que o usuário esteja logado E
 * tenha seu e-mail verificado.
 *
 * @architecture
 * 1. Lê `currentUser` e `loading` do AuthContext.
 * 2. **A CORREÇÃO CRUCIAL:** Se `loading` for `true`, ele retorna `null`, esperando
 *    silenciosamente o AuthContext terminar sua verificação inicial.
 * 3. Apenas quando `loading` for `false`, ele executa a lógica de verificação.
 * 4. Se não houver usuário, redireciona para /login.
 * 5. Se o usuário não tiver o e-mail verificado, redireciona para /verify-email.
 * 6. Se tudo estiver correto, renderiza a rota filha através do <Outlet />.
 */
function RequireVerifiedEmail() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Espera o AuthContext terminar sua verificação.
  // Isso impede a tomada de decisões com dados de cache desatualizados.
  if (loading) {
    return null;
  }

  // 2. Após o carregamento, verifica se o usuário existe.
  // Esta é uma dupla checagem importante.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verifica a condição principal: o e-mail está verificado?
  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // 4. Se todas as condições foram atendidas, libera o acesso.
  return <Outlet />;
}

export default RequireVerifiedEmail;
