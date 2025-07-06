// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { toast, Toaster } from 'react-hot-toast'; // Mudei para react-hot-toast como no seu original
import { EnvelopeSimple } from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  // `emailSent` é mais descritivo que `isSending` para desabilitar o botão.
  const [emailSent, setEmailSent] = useState(false);

  // A LÓGICA CORRETA: Reage ao estado do AuthContext
  useEffect(() => {
    // Redireciona se o usuário já estiver verificado.
    if (currentUser?.emailVerified) {
      toast.success('E-mail verificado! Redirecionando...');
      setTimeout(() => navigate('/', { replace: true }), 1500);
      return;
    }

    // Se por algum motivo não houver usuário, volta para o login.
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    // Bônus de UX: Verificador em segundo plano
    const intervalId = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
    }, 10000); // Tenta recarregar a cada 10s para acionar o AuthContext

    return () => clearInterval(intervalId);
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Novo e-mail de verificação enviado!');
      setEmailSent(true);
    } catch (error) {
      console.error('Erro ao reenviar verificação:', error);
      toast.error('Erro ao reenviar. Tente novamente mais tarde.');
    }
  };

  const handleLogoutAndRedirect = async () => {
    await logout();
    // O logout no contexto já redireciona, mas garantimos aqui também.
    navigate('/login');
  };

  // Se o `currentUser` ainda não carregou, mostramos um loader.
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ollo-light-50 dark:bg-ollo-dark-900">
        <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  // A ESTRUTURA VISUAL CORRETA: Seu código JSX original com as classes corretas.
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          {/* Imagem do Logo - restaurada do seu código */}
          <img
            src="/images/logo_ollo.jpeg"
            alt="OLLOAPP Logo"
            className="mx-auto h-16 w-auto"
          />

          {/* Título - restaurado do seu código */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Confirme seu e-mail
          </h2>

          {/* Parágrafo - restaurado do seu código */}
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Um link de verificação foi enviado para seu e-mail. Após confirmar,
            você terá acesso completo ao OLLOAPP.
          </p>

          {/* Imagem do Favicon - restaurada do seu código */}
          <img
            src="/images/favicon.ico"
            alt="Ícone OLLOAPP"
            className="mx-auto h-10 w-10 mt-2"
          />

          {/* E-mail do usuário - restaurado do seu código */}
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-2">
            {currentUser?.email}
          </div>

          {/* Container dos Botões - restaurado do seu código */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            {/* Botão Reenviar - classes restauradas do seu código */}
            <button
              onClick={handleResendEmail}
              disabled={emailSent}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary ${
                emailSent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <EnvelopeSimple size={18} weight="bold" />
              {emailSent ? 'E-mail reenviado' : 'Reenviar e-mail'}
            </button>

            {/* Botão Logout - classes restauradas do seu código */}
            <button
              onClick={handleLogoutAndRedirect}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
            >
              Fazer logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
