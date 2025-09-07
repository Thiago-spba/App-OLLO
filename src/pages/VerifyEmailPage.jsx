// ARQUIVO COMPLETO: src/pages/Auth/VerifyEmailPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// CORREÇÃO: O caminho da importação foi ajustado de '../../' para '../'. Este era o erro final.
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { EnvelopeSimple, SignOut } from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const {
    currentUser,
    logout,
    isEmailVerified,
    resendVerificationEmail,
    reloadCurrentUser,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEmailVerified) {
      navigate('/', { replace: true });
      return;
    }

    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        reloadCurrentUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEmailVerified, currentUser, navigate, reloadCurrentUser]);

  const handleResendEmail = async () => {
    await resendVerificationEmail();
  };

  const handleLogoutAndRedirect = async () => {
    // Passamos a função de navegação diretamente para o logout, como planejado no AuthContext.
    await logout(() => navigate('/login'));
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ollo-light-50 dark:bg-ollo-dark-900">
        <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-md w-full p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700">
          <img
            src="/images/logo_ollo.jpeg"
            alt="OLLOAPP Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="text-2xl font-bold mt-4">Confirme seu e-mail</h2>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
            Um link de verificação foi enviado para seu e-mail. Após confirmar,
            você terá acesso completo à OLLO.
          </p>
          <div className="text-sm font-medium mt-2 break-all">
            {currentUser?.email}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button
              onClick={handleResendEmail}
              className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary-light`}
            >
              <EnvelopeSimple size={20} weight="bold" />
              Reenviar e-mail
            </button>
            <button
              onClick={handleLogoutAndRedirect}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out"
            >
              <SignOut size={20} weight="bold" />
              Fazer logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
