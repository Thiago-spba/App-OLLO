// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth'; // Importa onAuthStateChanged
import { auth } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';

const VerifyEmailPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // MUDANÇA 1: Usa um estado local para o usuário desta página
  const [pageUser, setPageUser] = useState(auth.currentUser);

  useEffect(() => {
    // Escuta por mudanças no estado de autenticação do Firebase.
    // Isso garante que temos a informação mais atual.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageUser(user);
        // Se o usuário já estiver verificado (ex: clicou no link e voltou para a aba),
        // recarrega os dados dele e o envia para a home.
        if (user.emailVerified) {
          toast.success('Email verificado com sucesso! Redirecionando...');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        // Se o usuário deslogou, envia para a página de login.
        setPageUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!pageUser) {
      toast.error('Ocorreu um erro. Por favor, faça login novamente.');
      return;
    }
    try {
      await sendEmailVerification(pageUser);
      toast.success(
        'Um novo link de verificação foi enviado para o seu e-mail!'
      );
    } catch (error) {
      toast.error(
        'Ocorreu um erro ao reenviar o e-mail. Tente novamente mais tarde.'
      );
    }
  };

  const handleLogoutAndRedirect = async () => {
    await logout();
    navigate('/login');
  };

  // MUDANÇA 2: A lógica de carregamento agora é baseada no usuário local da página.
  if (!pageUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-ollo-deep">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Confirme seu e-mail
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Enviamos um link de verificação para{' '}
            <strong>{pageUser.email}</strong>. Por favor, verifique sua caixa de
            entrada (e a pasta de spam) para ativar sua conta.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Após verificar, você pode fazer o login.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleResendEmail}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary"
            >
              Reenviar e-mail
            </button>
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
