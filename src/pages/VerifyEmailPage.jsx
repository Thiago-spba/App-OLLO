// ARQUIVO OTIMIZADO: src/pages/Auth/VerifyEmailPage.jsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import {
  EnvelopeSimple,
  SignOut,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail, reloadCurrentUser } =
    useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const intervalRef = useRef(null);
  const cooldownRef = useRef(null);

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

  // Função para verificar status do email
  const checkEmailVerification = useCallback(async () => {
    if (checkingEmail) return; // Previne múltiplas verificações simultâneas

    setCheckingEmail(true);
    try {
      const refreshedUser = await reloadCurrentUser();

      if (refreshedUser?.emailVerified) {
        cleanupTimers();
        toast.success('✅ E-mail verificado com sucesso!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#FFFFFF',
          },
        });

        // Pequeno delay para mostrar o toast antes de navegar
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);

        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast.error('Erro ao verificar status do email');
    } finally {
      setCheckingEmail(false);
    }
    return false;
  }, [checkingEmail, reloadCurrentUser, navigate, cleanupTimers]);

  // Gerenciar cooldown do reenvio
  const startResendCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    // Redirecionamento se usuário já verificado
    if (currentUser?.emailVerified) {
      navigate('/', { replace: true });
      return;
    }

    // Redirecionamento se não há usuário logado
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    // Toast inicial informativo
    toast('📧 Verifique sua caixa de entrada e spam', {
      duration: 4000,
      icon: '💡',
    });

    // Verificação inicial imediata
    checkEmailVerification();

    // Configurar polling inteligente
    intervalRef.current = setInterval(checkEmailVerification, 5000);

    // Cleanup ao desmontar componente
    return cleanupTimers;
  }, [currentUser, navigate, checkEmailVerification, cleanupTimers]);

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const result = await resendVerificationEmail();

      if (result?.success) {
        toast.success('📨 Email de verificação reenviado!', {
          duration: 4000,
        });
        startResendCooldown();
      } else {
        toast.error('❌ Erro ao reenviar email. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      toast.error('❌ Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogoutAndRedirect = async () => {
    cleanupTimers(); // Limpar timers antes do logout

    try {
      const result = await logout();
      if (result?.success) {
        toast.success('👋 Logout realizado com sucesso');
        navigate('/login', { replace: true });
      } else {
        toast.error('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro inesperado no logout');
    }
  };

  const handleManualCheck = () => {
    if (!checkingEmail) {
      checkEmailVerification();
      toast.loading('Verificando...', { duration: 2000 });
    }
  };

  // Loading se usuário não carregado
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ollo-light-50 dark:bg-ollo-dark-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin"></div>
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
          style: {
            maxWidth: '500px',
          },
        }}
      />

      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-md w-full p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="relative">
            <img
              src="/images/logo_ollo.jpeg"
              alt="OLLOAPP Logo"
              className="mx-auto h-16 w-auto"
              onError={(e) => {
                e.target.src = '/images/logo_fallback.png'; // Fallback se logo não carregar
              }}
            />
            <div className="absolute -top-2 -right-2">
              <Warning size={24} weight="fill" className="text-yellow-500" />
            </div>
          </div>

          {/* Título e descrição */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold mt-4">Confirme seu e-mail</h2>
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
              Um link de verificação foi enviado para seu e-mail. Após
              confirmar, você terá acesso completo à OLLO.
            </p>
            <div className="text-sm font-medium mt-2 break-all bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              📧 {currentUser?.email}
            </div>
          </div>

          {/* Status de verificação */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {checkingEmail ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <EnvelopeSimple size={20} className="text-blue-500" />
              )}
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {checkingEmail ? 'Verificando...' : 'Aguardando verificação'}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Verificação automática a cada 5 segundos
            </p>
          </div>

          {/* Botões de ação */}
          <div className="space-y-4">
            {/* Verificação manual */}
            <button
              onClick={handleManualCheck}
              disabled={checkingEmail}
              className="w-full px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircle size={20} weight="bold" />
              {checkingEmail ? 'Verificando...' : 'Já verifiquei'}
            </button>

            {/* Botões de reenvio e logout */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <EnvelopeSimple size={20} weight="bold" />
                {isResending
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s`
                    : 'Reenviar e-mail'}
              </button>

              <button
                onClick={handleLogoutAndRedirect}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <SignOut size={20} weight="bold" />
                Fazer logout
              </button>
            </div>
          </div>

          {/* Dicas adicionais */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              💡 <strong>Dica:</strong> Verifique sua pasta de spam
            </p>
            <p>
              🔄 <strong>Reenvio:</strong> Disponível a cada 60 segundos
            </p>
            <p>
              ⚡ <strong>Automático:</strong> Redirecionamento após verificação
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
