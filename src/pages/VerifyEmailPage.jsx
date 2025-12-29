// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

// Ícones
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
  const { currentUser, logout, resendVerificationEmail, forceReloadUser } =
    useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // --- LÓGICA DE VERIFICAÇÃO ---

  // Função centralizada para checar status
  const checkStatus = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setIsChecking(true);
        toast.loading('Verificando status...', { id: 'verify-check' });
      }

      try {
        // Chama a função aprimorada do Contexto
        const updatedUser = await forceReloadUser();

        if (updatedUser?.emailVerified) {
          toast.success('Email confirmado com sucesso!', {
            id: 'verify-check',
          });
          // Pequeno delay para o usuário ver o sucesso antes de sair
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else if (isManual) {
          toast.error('Ainda não detectamos a verificação.', {
            id: 'verify-check',
          });
        }
      } catch (error) {
        console.error('Erro ao verificar:', error);
        if (isManual) toast.error('Erro de conexão.', { id: 'verify-check' });
      } finally {
        if (isManual) setIsChecking(false);
      }
    },
    [forceReloadUser, navigate]
  );

  // Efeito 1: Monitoramento Automático
  // Verifica a cada 5 segundos se o usuário já clicou no link na outra aba
  useEffect(() => {
    // Se já estiver verificado, redireciona imediatamente
    if (currentUser?.emailVerified) {
      navigate('/', { replace: true });
      return;
    }

    const interval = setInterval(() => {
      checkStatus(false); // check silencioso
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, checkStatus, navigate]);

  // --- LÓGICA DE REENVIO ---

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);

    try {
      const result = await resendVerificationEmail();
      if (result?.success) {
        toast.success('Email reenviado!');
        setResendCooldown(60);

        // Countdown visual
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error('Erro ao reenviar.');
      }
    } catch (e) {
      toast.error('Falha ao reenviar.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Se não houver usuário (logout forçado), redireciona
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-blue-600 mb-2">
          OLLO
        </h1>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link para{' '}
          <span className="font-medium text-blue-600">{currentUser.email}</span>
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
              onClick={() => checkStatus(true)}
              disabled={isChecking}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isChecking ? (
                'Verificando...'
              ) : (
                <>
                  <CheckIcon /> Já verifiquei meu e-mail
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
                : 'Reenviar e-mail'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Sair e usar outra conta
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            O sistema verifica automaticamente a cada 5 segundos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
