// ARQUIVO COMPLETO E DEFINITIVO: src/pages/Auth/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Mantido o caminho que você corrigiu
import { toast, Toaster } from 'react-hot-toast';
import { EnvelopeSimple, SignOut } from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail, reloadCurrentUser } =
    useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Redirecionamento 1: Se o usuário já estiver verificado, vai para a home.
    if (currentUser?.emailVerified) {
      navigate('/', { replace: true });
      return;
    }
    // Redirecionamento 2: Se não houver usuário logado, vai para o login.
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    // <<< A LÓGICA DE POLLING DEFINITIVA >>>
    // Esta estratégia é a padrão da indústria. Ela verifica o estado periodicamente
    // em vez de reagir agressivamente a eventos.
    const intervalId = setInterval(async () => {
      // O 'reloadCurrentUser' é a nossa nova função robusta do useAuth.
      // Ela recarrega, atualiza o estado, e retorna o usuário atualizado.
      const refreshedUser = await reloadCurrentUser();

      // Se a recarga foi bem-sucedida E o usuário está verificado...
      if (refreshedUser?.emailVerified) {
        toast.success('E-mail verificado! Bem-vindo(a) à OLLO.');
        clearInterval(intervalId); // Pára o verificador.
        navigate('/', { replace: true }); // Envia o usuário para a aplicação.
      }
    }, 5000); // Verifica a cada 5 segundos - um intervalo gentil e eficaz.

    // A parte mais importante: A função de limpeza.
    // Quando o componente for desmontado (usuário sai da página), paramos o verificador.
    // Isso previne memory leaks e execuções desnecessárias.
    return () => clearInterval(intervalId);
  }, [currentUser, navigate, reloadCurrentUser]);

  const handleResendEmail = async () => {
    if (isResending) return;
    setIsResending(true);
    await resendVerificationEmail();
    setTimeout(() => setIsResending(false), 60000); // Cooldown de 60 segundos
  };

  const handleLogoutAndRedirect = async () => {
    // Alteramos para a versão do seu hook, que não recebe o navigate.
    // O redirecionamento é responsabilidade da página após o logout ser bem-sucedido.
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  // Loader caso o currentUser ainda não tenha sido carregado
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ollo-light-50 dark:bg-ollo-dark-900">
        <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    // Seu JSX existente - 100% PRESERVADO
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
              disabled={isResending}
              className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-full flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              <EnvelopeSimple size={20} weight="bold" />
              {isResending ? 'Aguarde...' : 'Reenviar e-mail'}
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
