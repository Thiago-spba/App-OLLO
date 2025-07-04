// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import toast, { Toaster } from 'react-hot-toast';
import { EnvelopeSimple } from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pageUser, setPageUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageUser(user);
        if (user.emailVerified) {
          toast.success('Email verificado com sucesso! Redirecionando...');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
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
      console.error('Erro ao reenviar o e-mail:', error);
      toast.error('Ocorreu um erro ao reenviar. Tente novamente mais tarde.');
    }
  };

  const handleLogoutAndRedirect = async () => {
    await logout();
    navigate('/login');
  };

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
          {/* LOGO TOPO */}
          <img
            src="/images/logo_ollo.jpeg"
            alt="OLLOAPP Logo"
            className="mx-auto h-16 w-auto"
          />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Confirme seu e-mail
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Chegou a hora de validar sua conta! O link de verificação foi
            enviado para seu e-mail. Isso garante sua segurança e ativa todos os
            recursos do OLLOAPP.
          </p>

          {/* Favicon visual no fim (aumentado) */}
          <img
            src="/images/favicon.ico"
            alt="OLLOAPP Ícone"
            className="mx-auto h-10 w-10 mt-2"
          />

          {/* E-mail mostrado no fim */}
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-2">
            {pageUser.email}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button
              onClick={handleResendEmail}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-ollo-primary hover:bg-ollo-primary-dark rounded-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary"
            >
              <EnvelopeSimple size={18} weight="bold" />
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
