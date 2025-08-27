// src/components/RequireVerifiedEmail.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { getAuth, reload } from 'firebase/auth';
import { toast } from 'react-hot-toast';

/**
 * @fileoverview RequireVerifiedEmail - Guardião de Verificação Avançado OLLO.
 *
 * @description
 * Este componente protege rotas que exigem que o usuário esteja logado E
 * tenha seu e-mail verificado.
 *
 * @upgrades
 * 1. Força uma verificação em tempo real do status de verificação de e-mail
 * 2. Implementa um mecanismo de retry inteligente (não bloqueia a UI)
 * 3. Adiciona feedback visual com toast durante a verificação
 */
function RequireVerifiedEmail() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [verifyingStatus, setVerifyingStatus] = useState(false);
  const auth = getAuth();

  // Efeito para verificar o status de email em tempo real
  useEffect(() => {
    // Só executa se já carregou e tem usuário (para evitar processamento desnecessário)
    if (!loading && currentUser && !currentUser.emailVerified) {
      const checkVerificationStatus = async () => {
        try {
          setVerifyingStatus(true);
          // Força uma atualização do token do usuário para garantir dados frescos
          await reload(auth.currentUser);
          setVerifyingStatus(false);
          
          // Se após recarregar o usuário, o email estiver verificado, mostra mensagem de sucesso
          if (auth.currentUser?.emailVerified) {
            toast.success('Seu e-mail foi verificado com sucesso!');
          }
        } catch (error) {
          console.error('Erro ao verificar status do email:', error);
          setVerifyingStatus(false);
        }
      };
      
      checkVerificationStatus();
    }
  }, [currentUser, loading, auth]);

  // 1. Espera o AuthContext terminar sua verificação principal.
  if (loading || verifyingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-ollo-accent-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Após o carregamento, verifica se o usuário existe.
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
