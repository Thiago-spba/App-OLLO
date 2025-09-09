// ARQUIVO CORRIGIDO: src/pages/VerifyEmailPage.jsx

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
} from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail, reloadCurrentUser } =
    useAuth();
  const navigate = useNavigate();

  // Estados locais
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Refs para controle de timers
  const intervalRef = useRef(null);
  const cooldownRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Função para limpar todos os timers
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

  // Função segura para verificar status do email
  const checkEmailVerification = useCallback(
    async (isManual = false) => {
      // Prevenir verificações simultâneas ou após unmount
      if (checkingEmail || isUnmountedRef.current) return false;

      // Throttle automático: mínimo 3 segundos entre verificações
      const now = Date.now();
      if (!isManual && lastCheckTime && now - lastCheckTime < 3000) {
        console.log('[VerifyEmail] Verificação muito frequente, pulando');
        return false;
      }

      setCheckingEmail(true);
      setLastCheckTime(now);
      setCheckCount((prev) => prev + 1);

      console.log(
        `[VerifyEmail] Verificação ${checkCount + 1} ${isManual ? '(manual)' : '(automática)'}`
      );

      try {
        const refreshedUser = await reloadCurrentUser();

        if (isUnmountedRef.current) return false;

        if (refreshedUser?.emailVerified) {
          console.log('[VerifyEmail] Email verificado com sucesso!');
          cleanupTimers();

          toast.success('Email verificado com sucesso!', {
            duration: 3000,
            style: { background: '#10B981', color: '#FFFFFF' },
          });

          // Delay antes de navegar para mostrar o toast
          setTimeout(() => {
            if (!isUnmountedRef.current) {
              navigate('/', { replace: true });
            }
          }, 1500);

          return true;
        } else {
          console.log('[VerifyEmail] Email ainda não verificado');
          if (isManual) {
            toast(
              'Email ainda não verificado. Verifique sua caixa de entrada.',
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

        // Em caso de erro repetido, aumentar intervalo de verificação
        if (checkCount > 5) {
          console.log(
            '[VerifyEmail] Muitos erros, reduzindo frequência de verificação'
          );
          cleanupTimers();
          // Reagendar com intervalo maior
          intervalRef.current = setInterval(
            () => checkEmailVerification(),
            15000
          );
        }
      } finally {
        if (!isUnmountedRef.current) {
          setCheckingEmail(false);
        }
      }

      return false;
    },
    [
      checkingEmail,
      lastCheckTime,
      checkCount,
      reloadCurrentUser,
      navigate,
      cleanupTimers,
    ]
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

    // Verificar redirecionamentos necessários
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

    // Toast inicial apenas uma vez
    toast('Verifique sua caixa de entrada e pasta de spam', {
      duration: 5000,
      icon: '📧',
    });

    // Primeira verificação após 2 segundos
    const initialCheckTimeout = setTimeout(() => {
      if (!isUnmountedRef.current) {
        checkEmailVerification();
      }
    }, 2000);

    // Configurar polling com intervalo maior (10 segundos)
    const pollingTimeout = setTimeout(() => {
      if (!isUnmountedRef.current) {
        intervalRef.current = setInterval(() => {
          checkEmailVerification();
        }, 10000);
      }
    }, 5000);

    // Cleanup
    return () => {
      console.log('[VerifyEmail] Cleanup da página');
      isUnmountedRef.current = true;
      clearTimeout(initialCheckTimeout);
      clearTimeout(pollingTimeout);
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
        toast.success('Email de verificação reenviado!', { duration: 4000 });
        startResendCooldown();

        // Reset contador de verificações após reenvio
        setCheckCount(0);
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
              Verificação automática a cada 10 segundos
            </p>
            {checkCount > 0 && (
              <p className="text-xs text-blue-500 mt-1">
                Tentativas: {checkCount}
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

            {/* Botões de reenvio e logout */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <EnvelopeSimple size={20} weight="bold" />
                {isResending
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s`
                    : 'Reenviar email'}
              </button>

              <button
                onClick={handleLogoutAndRedirect}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <SignOut size={20} weight="bold" />
                Sair
              </button>
            </div>
          </div>

          {/* Dicas */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p>
                <strong>💡 Dica:</strong> Verifique sua pasta de spam
              </p>
              <p>
                <strong>🔄 Reenvio:</strong> Disponível a cada 60 segundos
              </p>
              <p>
                <strong>⚡ Automático:</strong> Verificação a cada 10 segundos
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
