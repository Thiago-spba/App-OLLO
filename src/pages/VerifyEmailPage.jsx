// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
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
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // --- LÓGICA BLINDADA ---
  const checkVerificationStatus = useCallback(async () => {
    // Bypass no React Context, vai direto no SDK
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return false;

    try {
      // 1. Força atualização do objeto User
      await user.reload();

      // 2. [NOVO] Força a renovação do TOKEN para garantir que claims sejam atualizadas
      if (user.emailVerified) {
        await user.getIdToken(true); // <--- O PULO DO GATO

        console.log('Verificação confirmada! Token renovado.');
        toast.success('Confirmado! Redirecionando...', { duration: 2000 });

        // Atraso curto para o usuário ver o toast
        setTimeout(() => {
          // Hard Reload para limpar qualquer cache de estado do React
          window.location.href = '/';
        }, 1500);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no polling:', error);
      return false;
    }
  }, []);

  // Botão manual ("Já cliquei no link")
  const handleManualCheck = async () => {
    if (isCheckingManually) return;
    setIsCheckingManually(true);
    toast.loading('Verificando...', { id: 'check' });

    const isVerified = await checkVerificationStatus();

    if (!isVerified) {
      toast.error(
        'Ainda consta como pendente. Tente novamente em alguns segundos.',
        { id: 'check' }
      );
    }
    // Se for verificado, o redirecionamento acontece dentro do checkVerificationStatus
    setIsCheckingManually(false);
  };

  // Polling automático (Verifica sozinho a cada 3s)
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Se o contexto já pegou a atualização
    if (currentUser.emailVerified) {
      window.location.href = '/';
      return;
    }

    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, navigate, checkVerificationStatus]);

  // Reenvio de e-mail (Mantido igual)
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    toast.loading('Enviando...', { id: 'resend' });

    try {
      // Tenta usar a função Cloud, se falhar, usa o método nativo como fallback
      try {
        const sendEmailFn = httpsCallable(
          functions,
          'sendBrevoVerificationEmail'
        );
        await sendEmailFn({
          displayName: currentUser.displayName || 'Usuário',
        });
      } catch (cloudError) {
        console.warn('Falha na cloud function, tentando nativo...', cloudError);
        const auth = getAuth();
        if (auth.currentUser) await auth.currentUser.sendEmailVerification();
      }

      toast.success('Link enviado! Verifique também o Spam.', { id: 'resend' });

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
      console.error(error);
      toast.error('Erro ao enviar. Tente novamente.', { id: 'resend' });
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
        <h1 className="text-center text-3xl font-bold text-[#0D4D44] mb-2">
          OLLO
        </h1>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link seguro para{' '}
          <span className="font-medium text-[#0D4D44]">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <EnvelopeIcon />
            <p className="mt-4 text-sm text-gray-500">
              Clique no link enviado para ativar sua conta.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleManualCheck}
              disabled={isCheckingManually}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D4D44] hover:bg-[#093630] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
            >
              {resendCooldown > 0
                ? `Aguarde ${resendCooldown}s`
                : 'Reenviar e-mail'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
            >
              Sair e usar outra conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
