// src/pages/VerifyEmailPage.jsx
// VERSÃO DEFINITIVA E CORRETA: Simplificada para usar o hook useAuth robusto.

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import {
  EnvelopeSimple,
  SignOut,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';

const VerifyEmailPage = () => {
  const { currentUser, logout, resendVerificationEmail, forceReloadUser } =
    useAuth();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownTimerRef = useRef(null);

  // Redireciona se o usuário não deveria estar aqui (logado e verificado, ou deslogado)
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser.emailVerified) {
      toast.success('Seu e-mail já está verificado!');
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  // Gerenciador do cooldown para o botão de reenviar
  const startResendCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Limpa o timer quando o componente é desmontado para evitar memory leaks
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Função para o botão "Já verifiquei"
  const handleManualCheck = async () => {
    setIsCheckingManually(true);
    const toastId = toast.loading('Verificando status do e-mail...');

    await forceReloadUser();

    if (currentUser && !currentUser.emailVerified) {
      toast.error(
        'E-mail ainda não verificado. Por favor, cheque sua caixa de entrada.',
        { id: toastId }
      );
    } else {
      toast.dismiss(toastId);
    }

    setIsCheckingManually(false);
  };

  // Função para reenviar o e-mail de verificação
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);

    const result = await resendVerificationEmail();
    if (result?.success) {
      startResendCooldown();
    }

    setIsResending(false);
  };

  // Função para logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!currentUser || currentUser.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-ollo-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link de verificação para{' '}
          <span className="font-medium text-ollo-primary">
            {currentUser?.email}
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <EnvelopeSimple size={48} className="mx-auto text-ollo-primary" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Clique no link enviado para seu e-mail para ativar sua conta.
                Não se esqueça de verificar sua pasta de spam.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleManualCheck}
                disabled={isCheckingManually}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingManually ? (
                  'Verificando...'
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" /> Já verifiquei
                  </>
                )}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  'Reenviando...'
                ) : resendCooldown > 0 ? (
                  <>
                    <Warning size={20} className="mr-2" /> Aguarde{' '}
                    {resendCooldown}s
                  </>
                ) : (
                  <>
                    <EnvelopeSimple size={20} className="mr-2" /> Reenviar
                    e-mail
                  </>
                )}
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              >
                <SignOut size={20} className="mr-2" />
                Sair e usar outra conta
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default VerifyEmailPage;
