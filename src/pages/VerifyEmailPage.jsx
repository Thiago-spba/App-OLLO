// src/pages/VerifyEmailPage.jsx
// CORREÇÃO DEFINITIVA - SEM LOOPS DE REDIRECIONAMENTO

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// Ícones SVG simples
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
  const { currentUser, logout, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  // CORREÇÃO PRINCIPAL: Verificação direta do Firebase Auth
  const checkEmailVerificationDirect = useCallback(async () => {
    console.log('[VerifyEmail] Verificação direta do Firebase...');

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe(); // Limpar listener imediatamente

        if (!user) {
          console.log('[VerifyEmail] Nenhum usuário encontrado');
          navigate('/login', { replace: true });
          resolve(false);
          return;
        }

        // Forçar reload e verificar status
        try {
          await user.reload();
          console.log(
            `[VerifyEmail] Status após reload: ${user.emailVerified}`
          );

          if (user.emailVerified) {
            console.log('[VerifyEmail] Email verificado! Redirecionando...');
            toast.success('Email verificado com sucesso!', { duration: 3000 });

            // Aguardar um pouco antes de redirecionar para garantir que o toast seja visto
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);

            resolve(true);
          } else {
            console.log('[VerifyEmail] Email ainda não verificado');
            resolve(false);
          }
        } catch (error) {
          console.error('[VerifyEmail] Erro ao recarregar usuário:', error);
          resolve(false);
        }
      });
    });
  }, [navigate]);

  // Effect principal - verificação inicial única
  useEffect(() => {
    if (hasChecked) return; // Evitar múltiplas verificações

    console.log('[VerifyEmail] Iniciando verificação inicial');
    setHasChecked(true);

    // Verificação inicial imediata
    const initialCheck = async () => {
      const verified = await checkEmailVerificationDirect();
      if (!verified) {
        console.log('[VerifyEmail] Configurando verificação periódica');

        // Se não verificado, configurar verificações periódicas
        const interval = setInterval(async () => {
          console.log('[VerifyEmail] Verificação automática...');
          const isVerified = await checkEmailVerificationDirect();
          if (isVerified) {
            clearInterval(interval);
          }
        }, 15000); // A cada 15 segundos

        // Limpar intervalo após 5 minutos para evitar loops infinitos
        setTimeout(() => {
          clearInterval(interval);
          console.log(
            '[VerifyEmail] Verificação automática interrompida após 5 minutos'
          );
        }, 300000);

        return () => clearInterval(interval);
      }
    };

    initialCheck();
  }, [hasChecked, checkEmailVerificationDirect]);

  // Verificação manual
  const handleManualCheck = async () => {
    setIsChecking(true);
    toast.loading('Verificando status do email...', { id: 'checking' });

    try {
      const verified = await checkEmailVerificationDirect();
      if (!verified) {
        toast.error(
          'Email ainda não verificado. Verifique sua caixa de entrada.',
          { id: 'checking' }
        );
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro na verificação manual:', error);
      toast.error('Erro ao verificar. Tente novamente.', { id: 'checking' });
    } finally {
      setIsChecking(false);
    }
  };

  // Reenviar email
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const result = await resendVerificationEmail();
      if (result?.success) {
        toast.success('Email de verificação reenviado!');
        setResendCooldown(60);

        const countdown = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error('Erro ao reenviar email.');
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro ao reenviar:', error);
      toast.error('Erro ao reenviar email.');
    } finally {
      setIsResending(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Se não há usuário, mostrar loading
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">OLLO</h1>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link de verificação para{' '}
          <span className="font-medium text-blue-600">{currentUser.email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <EnvelopeIcon />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Clique no link enviado para ativar sua conta. Verifique também
                sua pasta de spam.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleManualCheck}
                disabled={isChecking}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isChecking ? (
                  'Verificando...'
                ) : (
                  <>
                    <CheckIcon />
                    Já verifiquei meu email
                  </>
                )}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
              >
                {isResending
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Aguarde ${resendCooldown}s`
                    : 'Reenviar email'}
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:text-red-200"
              >
                Sair e usar outra conta
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Verificações automáticas a cada 15 segundos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
