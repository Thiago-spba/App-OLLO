// src/pages/VerifyEmailPage.jsx
// VERSÃO FINAL CORRIGIDA - SEM LOOPS E SEM ERROS DE IMPORTAÇÃO

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { reload } from 'firebase/auth';
import { auth } from '../firebase/config';

// Ícones simples em SVG para evitar dependências problemáticas
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

const ClockIcon = () => (
  <svg
    className="w-4 h-4 inline mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon = () => (
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
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const LogoutIcon = () => (
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
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  // Estados do componente
  const [isResending, setIsResending] = useState(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs para controle de timers e cleanup
  const verificationIntervalRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Função para limpar todos os timers
  const cleanupTimers = useCallback(() => {
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  // Função para verificar se o email foi verificado
  const checkEmailVerification = useCallback(
    async (isManual = false) => {
      if (isUnmountedRef.current) return false;

      try {
        const user = auth.currentUser;
        if (user) {
          await reload(user);

          if (user.emailVerified) {
            console.log('[VerifyEmail] Email verificado com sucesso!');
            cleanupTimers();

            toast.success('Email verificado com sucesso! Redirecionando...', {
              duration: 3000,
            });

            setTimeout(() => {
              if (!isUnmountedRef.current) {
                navigate('/', { replace: true });
              }
            }, 2000);

            return true;
          } else if (isManual) {
            toast(
              'Email ainda não verificado. Verifique sua caixa de entrada e spam.',
              {
                icon: '📧',
                duration: 4000,
              }
            );
          }
        }
      } catch (error) {
        console.error('[VerifyEmail] Erro ao verificar email:', error);
        if (isManual) {
          toast.error('Erro ao verificar status do email. Tente novamente.');
        }
      }

      return false;
    },
    [navigate, cleanupTimers]
  );

  // Gerenciar cooldown do botão de reenviar
  const startResendCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Effect principal - executa uma única vez na montagem
  useEffect(() => {
    console.log('[VerifyEmail] Inicializando página de verificação');
    isUnmountedRef.current = false;

    // Verificar se o usuário deve estar nesta página
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentUser.emailVerified) {
      toast.success('Seu e-mail já está verificado!');
      navigate('/', { replace: true });
      return;
    }

    // Iniciar verificação automática a cada 10 segundos
    verificationIntervalRef.current = setInterval(() => {
      if (!isUnmountedRef.current) {
        checkEmailVerification(false);
      }
    }, 10000);

    // Cleanup na desmontagem
    return () => {
      console.log('[VerifyEmail] Cleanup da página');
      isUnmountedRef.current = true;
      cleanupTimers();
    };
  }, [currentUser, navigate, checkEmailVerification, cleanupTimers]);

  // Função para verificação manual
  const handleManualCheck = async () => {
    setIsCheckingManually(true);
    const toastId = toast.loading('Verificando status do e-mail...');

    try {
      const verified = await checkEmailVerification(true);
      if (!verified) {
        toast.dismiss(toastId);
      }
    } finally {
      setIsCheckingManually(false);
    }
  };

  // Função para reenviar email de verificação
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const result = await resendVerificationEmail();
      if (result?.success) {
        toast.success('Email de verificação reenviado com sucesso!');
        startResendCooldown();
      } else {
        toast.error('Erro ao reenviar email. Tente novamente.');
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro ao reenviar email:', error);
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  // Função para logout
  const handleLogout = async () => {
    cleanupTimers();
    await logout();
    navigate('/login', { replace: true });
  };

  // Loading state
  if (!currentUser || currentUser.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            OLLO
          </h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link de verificação para{' '}
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Ícone e instruções */}
            <div className="text-center">
              <EnvelopeIcon />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Clique no link enviado para seu e-mail para ativar sua conta.
                Não se esqueça de verificar sua pasta de spam.
              </p>
            </div>

            {/* Indicador de verificação automática */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon />
              Verificações automáticas em andamento...
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              {/* Botão "Já verifiquei" */}
              <button
                onClick={handleManualCheck}
                disabled={isCheckingManually}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingManually ? (
                  'Verificando...'
                ) : (
                  <>
                    <CheckIcon />
                    Já verifiquei
                  </>
                )}
              </button>

              {/* Botão "Reenviar email" */}
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {isResending ? (
                  'Reenviando...'
                ) : resendCooldown > 0 ? (
                  <>
                    <WarningIcon />
                    Aguarde {resendCooldown}s
                  </>
                ) : (
                  <>
                    <EnvelopeIcon />
                    Reenviar e-mail
                  </>
                )}
              </button>

              {/* Botão "Sair" */}
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                <LogoutIcon />
                Sair e usar outra conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
