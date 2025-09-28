// src/components/ProtectedRoute.jsx
// VERSÃO ROBUSTA - EVITA LOOPS DE REDIRECIONAMENTO

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificação direta do Firebase Auth para evitar problemas de sincronização
  useEffect(() => {
    const checkAuthStatus = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe(); // Limpar listener imediatamente

        if (!user) {
          console.log('[ProtectedRoute] Nenhum usuário autenticado');
          setVerificationStatus('no-user');
          setIsCheckingAuth(false);
          return;
        }

        try {
          // Forçar reload para ter o status mais atualizado
          await user.reload();

          console.log(
            `[ProtectedRoute] Usuário: ${user.email}, Email Verificado: ${user.emailVerified}`
          );

          if (user.emailVerified) {
            setVerificationStatus('verified');
          } else {
            setVerificationStatus('not-verified');
          }
        } catch (error) {
          console.error('[ProtectedRoute] Erro ao verificar usuário:', error);
          setVerificationStatus('error');
        } finally {
          setIsCheckingAuth(false);
        }
      });
    };

    // Só fazer a verificação se não estamos em loading e há mudança de rota
    if (!loading) {
      checkAuthStatus();
    }
  }, [loading, location.pathname]);

  // Aguardar carregamento inicial do Auth e nossa verificação
  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Lógica de redirecionamento baseada no status verificado
  switch (verificationStatus) {
    case 'no-user':
      console.log('[ProtectedRoute] Redirecionando para login - sem usuário');
      return <Navigate to="/login" replace state={{ from: location }} />;

    case 'not-verified':
      // Só redirecionar para verify-email se não estivermos já lá
      if (location.pathname !== '/verify-email') {
        console.log(
          '[ProtectedRoute] Redirecionando para verificação de email'
        );
        return (
          <Navigate to="/verify-email" replace state={{ from: location }} />
        );
      }
      break;

    case 'verified':
      // Se estivermos na página de verificação mas email já está verificado, redirecionar
      if (location.pathname === '/verify-email') {
        console.log(
          '[ProtectedRoute] Email já verificado, redirecionando para home'
        );
        return <Navigate to="/" replace />;
      }
      break;

    case 'error':
      console.error(
        '[ProtectedRoute] Erro na verificação, redirecionando para login'
      );
      return <Navigate to="/login" replace />;

    default:
      // Estado indefinido, aguardar
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
  }

  // Se chegamos aqui, o usuário tem permissão para acessar a rota
  return children || <Outlet />;
}
