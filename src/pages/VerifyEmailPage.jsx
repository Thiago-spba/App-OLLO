// ARQUIVO: src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { getAuth, sendEmailVerification, applyActionCode } from 'firebase/auth';

// --- ÍCONES (Verde OLLO) ---
const EnvelopeIcon = () => (
  <svg
    className="w-12 h-12 mx-auto text-[#0D4D44]"
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
  const { currentUser, reloadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Trava para evitar dupla verificação
  const processingRef = useRef(false);

  // --- 1. VALIDAÇÃO AUTOMÁTICA (CÉREBRO) ---
  useEffect(() => {
    const oobCode = searchParams.get('oobCode');

    // Se tiver código e não estiver processando
    if (oobCode && !processingRef.current) {
      processingRef.current = true;

      const autoVerify = async () => {
        const toastId = toast.loading('Validando sua conta...');
        try {
          const auth = getAuth();
          // Aplica o código do link
          await applyActionCode(auth, oobCode);

          // Atualiza o status local
          await reloadCurrentUser();

          toast.success('Sucesso! E-mail verificado.', { id: toastId });

          // Redireciona para Home
          setTimeout(() => navigate('/'), 2000);
        } catch (error) {
          console.error(error);
          let msg = 'Link inválido ou expirado.';
          if (error.code === 'auth/invalid-action-code') {
            msg = 'Este link já foi usado. Por favor, solicite um novo.';
          }
          toast.error(msg, { id: toastId });
        }
      };
      autoVerify();
    }
  }, [searchParams, navigate, reloadCurrentUser]);

  // --- 2. VERIFICAÇÃO MANUAL ---
  const handleManualCheck = async () => {
    setLoading(true);
    const toastId = toast.loading('Verificando status...');
    try {
      const updatedUser = await reloadCurrentUser();
      if (updatedUser?.emailVerified) {
        toast.success('Tudo certo! Entrando...', { id: toastId });
        setTimeout(() => (window.location.href = '/'), 1000);
      } else {
        toast.error(
          'Ainda pendente. Se já clicou, aguarde ou atualize a página.',
          { id: toastId }
        );
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. REENVIO DE E-MAIL ---
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    const toastId = toast.loading('Enviando novo link...');
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('E-mail enviado! Cheque o SPAM.', { id: toastId });
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
      }
    } catch (error) {
      toast.error('Erro ao enviar: ' + error.message, { id: toastId });
    }
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
          Enviamos um link para{' '}
          <span className="font-medium text-[#0D4D44]">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <EnvelopeIcon />
          <div className="mt-6 space-y-4">
            <button
              onClick={handleManualCheck}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D4D44] hover:bg-[#093630] transition-colors"
            >
              {loading ? (
                'Verificando...'
              ) : (
                <>
                  <CheckIcon /> Já cliquei no link!
                </>
              )}
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
