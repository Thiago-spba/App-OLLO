// ARQUIVO CORRIGIDO: src/pages/VerifyEmailPage.jsx
// Versão otimizada para o novo fluxo de verificação

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import {
  EnvelopeSimple,
  SignOut,
  CheckCircle,
  Warning,
  Clock,
  ArrowLeft,
} from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail, forceReloadUser } =
    useAuth();
  const navigate = useNavigate();

  // Estados locais
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // Refs para controle
  const intervalRef = useRef(null);
  const cooldownRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Função para limpar timers
  const cleanupTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  }, []);

  // Função para verificar status do email
  const checkEmailVerification = useCallback(
    async (isManual = false) => {
      if (checkingEmail || isUnmountedRef.current) return false;

      setCheckingEmail(true);
      setCheckCount((prev) => prev + 1);

      console.log(
        `[VerifyEmail] Verificação ${checkCount + 1} ${isManual ? '(manual)' : '(automática)'}`
      );

      try {
        const refreshedUser = await forceReloadUser();

        if (isUnmountedRef.current) return false;

        if (refreshedUser?.emailVerified) {
          console.log('[VerifyEmail] Email verificado com sucesso!');
          cleanupTimers();

          toast.success('Email verificado com sucesso! Redirecionando...', {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '600',
            },
          });

          // Delay antes de navegar
          setTimeout(() => {
            if (!isUnmountedRef.current) {
              navigate('/', { replace: true });
            }
          }, 2000);

          return true;
        } else {
          console.log('[VerifyEmail] Email ainda não verificado');
          if (isManual) {
            toast(
              'Email ainda não verificado. Verifique sua caixa de entrada e spam.',
              {
                icon: '📧',
                duration: 4000,
                style: { fontSize: '14px' },
              }
            );
          }
        }
      } catch (error) {
        console.error('[VerifyEmail] Erro ao verificar email:', error);

        if (isManual) {
          toast.error('Erro ao verificar status do email. Tente novamente.');
        }
      } finally {
        if (!isUnmountedRef.current) {
          setCheckingEmail(false);
        }
      }

      return false;
    },
    [checkingEmail, checkCount, forceReloadUser, navigate, cleanupTimers]
  );

  // Gerenciar cooldown do reenvio
  const startResendCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Effect principal
  useEffect(() => {
    console.log('[VerifyEmail] Inicializando página de verificação');
    isUnmountedRef.current = false;

    // Verificar redirecionamentos
    if (currentUser?.emailVerified) {
      console.log('[VerifyEmail] Usuário já verificado, redirecionando');
      navigate('/', { replace: true });
      return;
    }

    if (!currentUser) {
      console.log(
        '[VerifyEmail] Usuário não autenticado, redirecionando para login'
      );
      navigate('/login', { replace: true });
      return;
    }

    // Toast inicial
    toast('Verifique sua caixa de entrada e pasta de spam', {
      duration: 6000,
      icon: '📧',
      style: { fontSize: '14px' },
    });

    // Primeira verificação após 3 segundos
    const initialCheckTimeout = setTimeout(() => {
      if (!isUnmountedRef.current) {
        checkEmailVerification();
      }
    }, 3000);

    // Cleanup
    return () => {
      console.log('[VerifyEmail] Cleanup da página');
      isUnmountedRef.current = true;
      clearTimeout(initialCheckTimeout);
      cleanupTimers();
    };
  }, [currentUser, navigate, checkEmailVerification, cleanupTimers]);

  // Função para reenviar email
  const handleResendEmail = useCallback(async () => {
    if (isResending || resendCooldown > 0) return;

    console.log('[VerifyEmail] Reenviando email de verificação');
    setIsResending(true);

    try {
      const result = await resendVerificationEmail();

      if (result?.success) {
        toast.success('Email de verificação reenviado com sucesso!', {
          duration: 4000,
          style: { fontSize: '14px' },
        });
        startResendCooldown();
        setCheckCount(0); // Reset contador
      } else {
        toast.error('Erro ao reenviar email. Tente novamente.');
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro ao reenviar email:', error);
      toast.error('Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsResending(false);
    }
  }, [
    isResending,
    resendCooldown,
    resendVerificationEmail,
    startResendCooldown,
  ]);

  // Função para logout
  const handleLogoutAndRedirect = useCallback(async () => {
    console.log('[VerifyEmail] Fazendo logout');
    cleanupTimers();
    isUnmountedRef.current = true;

    try {
      const result = await logout();
      if (result?.success) {
        toast.success('Logout realizado com sucesso');
        navigate('/login', { replace: true });
      } else {
        toast.error('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro no logout:', error);
      toast.error('Erro inesperado no logout');
    }
  }, [logout, navigate, cleanupTimers]);

  // Função para verificação manual
  const handleManualCheck = useCallback(() => {
    if (!checkingEmail) {
      console.log('[VerifyEmail] Verificação manual solicitada');
      checkEmailVerification(true);
    }
  }, [checkingEmail, checkEmailVerification]);

  // Voltar para home (mesmo sem verificar)
  const handleGoBack = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // Loading se usuário não carregado
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { maxWidth: '500px' },
          duration: 4000,
        }}
      />

      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-md w-full p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="relative">
            <img
              src="/images/logo_ollo.jpeg"
              alt="OLLO Logo"
              className="mx-auto h-16 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute -top-2 -right-2">
              <Warning size={24} weight="fill" className="text-yellow-500" />
            </div>
          </div>

          {/* Título e descrição */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Confirme seu email</h2>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Um link de verificação foi enviado para seu email. Após confirmar,
              você terá acesso completo ao OLLO.
            </p>
            <div className="text-sm font-medium bg-gray-100 dark:bg-gray-700 p-3 rounded-lg break-all">
              📧 {currentUser?.email}
            </div>
          </div>

          {/* Status de verificação */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {checkingEmail ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Clock size={20} className="text-blue-500" />
              )}
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {checkingEmail ? 'Verificando...' : 'Aguardando verificação'}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Sistema verifica automaticamente
            </p>
            {checkCount > 0 && (
              <p className="text-xs text-blue-500 mt-1">
                Verificações: {checkCount}
              </p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="space-y-4">
            {/* Verificação manual */}
            <button
              onClick={handleManualCheck}
              disabled={checkingEmail}
              className="w-full px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircle size={20} weight="bold" />
              {checkingEmail ? 'Verificando...' : 'Já verifiquei'}
            </button>

            {/* Linha de botões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <EnvelopeSimple size={18} weight="bold" />
                {isResending
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s`
                    : 'Reenviar email'}
              </button>

              <button
                onClick={handleLogoutAndRedirect}
                className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <SignOut size={18} weight="bold" />
                Sair
              </button>
            </div>

            {/* Botão para voltar */}
            <button
              onClick={handleGoBack}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Continuar sem verificar (não recomendado)
            </button>
          </div>

          {/* Dicas */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="font-medium mb-2">📌 Instruções:</p>
              <ul className="text-left space-y-1">
                <li>• Verifique sua pasta de spam</li>
                <li>• O link pode demorar alguns minutos</li>
                <li>• Após clicar no link, volte aqui</li>
                <li>• Use "Já verifiquei" para verificar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
