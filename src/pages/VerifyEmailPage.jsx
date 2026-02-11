// ARQUIVO: src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { getAuth, sendEmailVerification, applyActionCode } from 'firebase/auth';

const EnvelopeIcon = () => (
  <svg
    className="w-16 h-16 mx-auto text-[#0D4D44] mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const VerifyEmailPage = () => {
  const { currentUser, reloadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const processingRef = useRef(false);

  // --- 1. LÓGICA DE AUTO-VERIFICAÇÃO ---
  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    // Se tiver código na URL, iniciamos a validação imediatamente
    if (oobCode && !processingRef.current) {
      processingRef.current = true;
      setStatus('verifying');

      const verifyCode = async () => {
        try {
          const auth = getAuth();
          await applyActionCode(auth, oobCode);

          // Sucesso!
          setStatus('success');
          toast.success('Conta verificada com sucesso!');

          // Tenta atualizar o status local se o usuário estiver logado
          if (auth.currentUser) {
            await reloadCurrentUser();
          }

          // Redireciona
          setTimeout(() => navigate('/'), 3000);
        } catch (error) {
          console.error(error);
          setStatus('error');
          let msg = 'O link é inválido ou expirou.';
          if (error.code === 'auth/invalid-action-code')
            msg = 'Link já utilizado ou inválido.';
          setErrorMessage(msg);
          toast.error(msg);
        }
      };

      verifyCode();
    }
  }, [searchParams, navigate, reloadCurrentUser]);

  // --- 2. REENVIO CORRIGIDO (Com URL certa) ---
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    const toastId = toast.loading('Enviando...');

    try {
      const auth = getAuth();
      if (auth.currentUser) {
        // Gera o link apontando para /verify-email
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);

        toast.success('Novo link enviado!', { id: toastId });
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((p) => {
            if (p <= 1) {
              clearInterval(timer);
              return 0;
            }
            return p - 1;
          });
        }, 1000);
      }
    } catch (error) {
      toast.error('Erro: ' + error.message, { id: toastId });
    }
  };

  const handleManualCheck = async () => {
    const toastId = toast.loading('Verificando...');
    try {
      const user = await reloadCurrentUser();
      if (user?.emailVerified) {
        toast.success('Confirmado! Entrando...', { id: toastId });
        window.location.href = '/';
      } else {
        toast.error('Ainda pendente.', { id: toastId });
      }
    } catch (e) {
      toast.error('Erro de conexão.', { id: toastId });
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D4D44] mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Validando seu e-mail...
          </h2>
          <p className="text-gray-500 mt-2">Por favor, aguarde um momento.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sucesso!
          </h2>
          <p className="text-gray-500 mt-2">
            Seu e-mail foi verificado. Redirecionando...
          </p>
        </div>
      </div>
    );
  }

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
          Enviamos um link para{' '}
          <span className="font-medium text-[#0D4D44]">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border dark:border-gray-700">
          <EnvelopeIcon />

          {status === 'error' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleManualCheck}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D4D44] hover:bg-[#093630] transition-colors"
            >
              Já cliquei no link!
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
            >
              {resendCooldown > 0
                ? `Aguarde ${resendCooldown}s`
                : 'Reenviar e-mail'}
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full text-center text-sm text-red-600 hover:text-red-800"
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
