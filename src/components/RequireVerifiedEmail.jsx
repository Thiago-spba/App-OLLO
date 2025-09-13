// ARQUIVO CORRIGIDO: src/components/RequireVerifiedEmail.jsx
// Versão sincronizada com o novo useAuth

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * @fileoverview RequireVerifiedEmail - Guardião de Verificação OLLO
 *
 * Protege rotas que exigem email verificado.
 * Agora sincronizado corretamente com o useAuth atualizado.
 */
function RequireVerifiedEmail() {
  const { currentUser, loading, forceReloadUser } = useAuth();
  const location = useLocation();
  const [verifyingStatus, setVerifyingStatus] = useState(false);

  // Effect para verificar status quando componente monta
  useEffect(() => {
    // Se tem usuário carregado mas email não verificado, força uma verificação
    if (!loading && currentUser && !currentUser.emailVerified) {
      const checkEmailStatus = async () => {
        console.log('[RequireVerifiedEmail] Verificando status do email...');
        setVerifyingStatus(true);

        try {
          const updatedUser = await forceReloadUser();

          if (updatedUser?.emailVerified) {
            console.log('[RequireVerifiedEmail] Email verificado detectado!');
            toast.success('Email verificado com sucesso! Bem-vindo ao OLLO!', {
              duration: 4000,
              style: {
                background: '#10B981',
                color: '#FFFFFF',
                fontWeight: '600',
              },
            });
          }
        } catch (error) {
          console.error(
            '[RequireVerifiedEmail] Erro ao verificar email:',
            error
          );
        } finally {
          setVerifyingStatus(false);
        }
      };

      // Verificar após um pequeno delay para evitar múltiplas verificações
      const timeout = setTimeout(checkEmailStatus, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentUser, loading, forceReloadUser]);

  // Loading state
  if (loading || verifyingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {verifyingStatus ? 'Verificando email...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  // Não autenticado - redirecionar para login
  if (!currentUser) {
    console.log(
      '[RequireVerifiedEmail] Usuário não autenticado, redirecionando para login'
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Email não verificado - redirecionar para verificação
  if (!currentUser.emailVerified) {
    console.log(
      '[RequireVerifiedEmail] Email não verificado, redirecionando para verify-email'
    );
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Tudo OK - permitir acesso
  console.log('[RequireVerifiedEmail] Acesso liberado para usuário verificado');
  return <Outlet />;
}

export default RequireVerifiedEmail;
