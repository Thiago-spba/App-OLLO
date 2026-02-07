// ARQUIVO: src/pages/VerifyEmailPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
// IMPORTANTE: Importamos a função solta do SDK
import { getAuth, sendEmailVerification } from 'firebase/auth';

// --- ÍCONES (Restaurados do seu design original) ---
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
  const { currentUser, reloadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // --- LÓGICA DE VERIFICAÇÃO ---
  const handleManualCheck = async () => {
    setLoading(true);
    const toastId = toast.loading('Consultando servidor...');

    try {
      // Chama a função do AuthContext
      const updatedUser = await reloadCurrentUser();

      if (updatedUser?.emailVerified) {
        toast.success('E-mail confirmado! Entrando...', { id: toastId });
        setTimeout(() => (window.location.href = '/'), 1000);
      } else {
        toast.error('Ainda pendente. Verifique se clicou no link.', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      // Botão de emergência em caso de erro de rede
      toast.error(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Erro de conexão.</span>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await logout();
                navigate('/login');
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm mt-1 hover:bg-red-700"
            >
              Clique aqui para validar via Login
            </button>
          </div>
        ),
        { id: toastId, duration: 8000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE REENVIO (CORRIGIDA) ---
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    const toastId = toast.loading('Enviando e-mail...');

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // [CORREÇÃO CRÍTICA]:
        // Usamos a função importada 'sendEmailVerification(user)'
        // Em vez de 'user.sendEmailVerification()'
        await sendEmailVerification(user);

        toast.success('Link enviado! Verifique o Spam.', { id: toastId });

        // Cooldown
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
      } else {
        toast.error('Usuário não identificado.', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar: ' + error.message, { id: toastId });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    // Layout Restaurado
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
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Clique no link enviado para ativar sua conta.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleManualCheck}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D4D44] hover:bg-[#093630] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Aguarde ${resendCooldown}s`
                : 'Reenviar e-mail'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-transparent dark:hover:bg-gray-700 rounded-md transition-colors"
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
