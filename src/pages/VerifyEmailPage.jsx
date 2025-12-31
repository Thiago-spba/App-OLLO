// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// --- ÍCONES ---
const EnvelopeIcon = () => (
  <svg
    className="w-12 h-12 mx-auto text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const VerifyEmailPage = () => {
  const { currentUser, logout, forceReloadUser } = useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // MUDANÇA: Lógica blindada para evitar erros no Firestore
  const checkVerificationStatus = useCallback(async () => {
    if (!currentUser) return false;

    try {
      // 1. Pergunta apenas ao Auth do Firebase se o status mudou
      await currentUser.reload();

      // 2. Verifica o status atualizado
      const isVerified = currentUser.emailVerified;

      // CORREÇÃO CRÍTICA: Só tenta atualizar o contexto/banco SE estiver verificado
      // Isso evita o erro "Client is offline" ou "Permission denied" no loop
      if (isVerified) {
        console.log('E-mail verificado! Sincronizando perfil...');
        await forceReloadUser();
      }

      return isVerified;
    } catch (error) {
      console.error('Erro ao verificar status (polling):', error);
      return false;
    }
  }, [currentUser, forceReloadUser]);

  // Botão manual
  const handleManualCheck = async () => {
    if (isCheckingManually) return;

    setIsCheckingManually(true);
    toast.loading('Verificando com o servidor...', { id: 'manual-check' });

    const isVerified = await checkVerificationStatus();

    if (isVerified) {
      toast.success('E-mail verificado! Entrando...', { id: 'manual-check' });
      setTimeout(() => {
        window.location.href = '/'; // REDIRECIONAMENTO FORÇADO
      }, 1500);
    } else {
      toast.dismiss('manual-check');
      toast('O sistema ainda consta como pendente.', {
        icon: '⏳',
        duration: 6000,
      });
      toast('Se já clicou no link, aguarde alguns segundos.', {
        icon: 'ℹ️',
        duration: 6000,
      });
    }

    setIsCheckingManually(false);
  };

  // Polling automático
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.emailVerified) {
      window.location.href = '/';
      return;
    }

    // Intervalo de verificação
    const interval = setInterval(async () => {
      const isVerified = await checkVerificationStatus();

      if (isVerified) {
        clearInterval(interval);
        toast.success(
          'E-mail verificado automaticamente! Bem-vindo ao OLLO 🎉'
        );
        setTimeout(() => {
          window.location.href = '/'; // REDIRECIONAMENTO FORÇADO
        }, 1500);
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(interval);
  }, [currentUser, checkVerificationStatus, navigate]);

  // Reenvio de e-mail
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    toast.loading('Enviando novo link...', { id: 'resend' });

    try {
      const sendEmailFn = httpsCallable(
        functions,
        'sendBrevoVerificationEmail'
      );
      await sendEmailFn({
        displayName: currentUser.displayName || 'Usuário',
      });

      toast.success('Novo link enviado! Verifique spam/lixo eletrônico.', {
        id: 'resend',
      });

      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao reenviar:', error);
      toast.error('Erro ao enviar. Tente novamente em alguns minutos.', {
        id: 'resend',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-blue-600 mb-2">
          OLLO
        </h1>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link para{' '}
          <span className="font-medium text-blue-600">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <EnvelopeIcon />
            <p className="mt-4 text-sm text-gray-500">
              Clique no link enviado para ativar sua conta. Verifique sua pasta
              de spam.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleManualCheck}
              disabled={isCheckingManually}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isCheckingManually ? (
                'Verificando...'
              ) : (
                <>
                  <CheckIcon /> Já cliquei no link!
                </>
              )}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 transition-colors"
            >
              {resendCooldown > 0
                ? `Aguarde ${resendCooldown}s`
                : isResending
                  ? 'Enviando...'
                  : 'Reenviar e-mail de verificação'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Sair e usar outra conta
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            A página atualiza automaticamente assim que a verificação for
            detectada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
