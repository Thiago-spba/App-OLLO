// ARQUIVO CORRIGIDO: src/pages/VerifyEmailPage.jsx
// Corrige o loop de renderização e melhora a verificação automática

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // CORREÇÃO: Usando nosso AuthContext
import { toast, Toaster } from 'react-hot-toast';
import { reload } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  EnvelopeSimple,
  SignOut,
  CheckCircle,
  Warning,
  Clock,
} from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  // CORREÇÃO: O hook correto parece ser useAuth, vindo do AuthContext que usamos no projeto.
  // Se você migrou para useAuthLogic, apenas troque esta linha.
  const { currentUser, logout, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  const cooldownRef = useRef(null);
  const isUnmountedRef = useRef(false);
  // MUDANÇA: Criamos uma ref para o intervalo da verificação automática
  const verificationIntervalRef = useRef(null);

  // MUDANÇA: Usaremos uma ref para a função de verificação para evitar o loop no useEffect
  const checkEmailVerificationRef = useRef(null);

  const cleanupTimers = useCallback(() => {
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  }, []);

  const checkEmailVerification = useCallback(
    async (isManual = false) => {
      // CORREÇÃO: Usamos um setter funcional para evitar a dependência de `checkingEmail`
      let isCurrentlyChecking = false;
      setCheckingEmail((prev) => {
        isCurrentlyChecking = prev;
        return true;
      });

      if (isCurrentlyChecking || isUnmountedRef.current) {
        setCheckingEmail(false);
        return false;
      }

      setCheckCount((prev) => prev + 1);

      console.log(
        `[VerifyEmail] Verificação ${isManual ? '(manual)' : '(automática)'}`
      );

      try {
        const user = auth.currentUser;
        if (user) {
          await reload(user);

          if (isUnmountedRef.current) return false;

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
          } else {
            console.log('[VerifyEmail] Email ainda não verificado');
            if (isManual) {
              toast(
                'Email ainda não verificado. Verifique sua caixa de entrada e spam.',
                { icon: '📧' }
              );
            }
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
    // CORREÇÃO: Removidas dependências instáveis. `Maps` e `cleanupTimers` são estáveis.
    [navigate, cleanupTimers]
  );

  // MUDANÇA: Mantém a ref sempre com a última versão da função
  useEffect(() => {
    checkEmailVerificationRef.current = checkEmailVerification;
  });

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

  // Effect principal
  useEffect(() => {
    console.log('[VerifyEmail] Inicializando página de verificação');
    isUnmountedRef.current = false;

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

    toast('Verifique sua caixa de entrada e pasta de spam', {
      duration: 6000,
      icon: '📧',
    });

    // CORREÇÃO: Substituímos o setTimeout por setInterval para verificações periódicas
    // e chamamos a função através da ref para não criar um loop.
    verificationIntervalRef.current = setInterval(() => {
      if (!isUnmountedRef.current) {
        checkEmailVerificationRef.current();
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => {
      console.log('[VerifyEmail] Cleanup da página');
      isUnmountedRef.current = true;
      cleanupTimers();
    };
    // CORREÇÃO: Removida a dependência `checkEmailVerification` para quebrar o loop.
  }, [currentUser, navigate, cleanupTimers]);

  const handleResendEmail = useCallback(async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const result = await resendVerificationEmail();
      if (result?.success) {
        toast.success('Email de verificação reenviado com sucesso!');
        startResendCooldown();
        setCheckCount(0);
      } else {
        toast.error('Erro ao reenviar email. Tente novamente.');
      }
    } catch (error) {
      console.error('[VerifyEmail] Erro ao reenviar email:', error);
      toast.error('Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  }, [
    isResending,
    resendCooldown,
    resendVerificationEmail,
    startResendCooldown,
  ]);

  const handleLogout = useCallback(async () => {
    cleanupTimers();
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate, cleanupTimers]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">{/* Seu logo aqui */}</div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link de verificação para{' '}
          <span className="font-medium text-ollo-primary">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <EnvelopeSimple size={48} className="mx-auto text-ollo-primary" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Clique no link enviado para seu email para ativar sua conta.
                Verifique também sua pasta de spam.
              </p>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Clock size={16} className="inline mr-1" />
              Verificações automáticas em andamento...
            </div>

            <div className="space-y-3">
              <button
                onClick={() => checkEmailVerification(true)}
                disabled={checkingEmail}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingEmail ? (
                  'Verificando...'
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Já verifiquei
                  </>
                )}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  'Reenviando...'
                ) : resendCooldown > 0 ? (
                  <>
                    <Warning size={16} className="mr-2" />
                    Aguarde {resendCooldown}s
                  </>
                ) : (
                  <>
                    <EnvelopeSimple size={16} className="mr-2" />
                    Reenviar email
                  </>
                )}
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                <SignOut size={16} className="mr-2" />
                Sair e usar outra conta
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default VerifyEmailPage;
