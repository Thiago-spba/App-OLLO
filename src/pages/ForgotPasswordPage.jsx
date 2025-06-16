import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const getFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'O e-mail fornecido é inválido.';
      case 'auth/user-not-found':
        return 'Nenhuma conta encontrada com este e-mail.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro ao enviar o e-mail. Tente novamente.';
    }
  };

  const onSubmit = async ({ email }) => {
    setIsSending(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    };

    try {
      await forgotPassword(email, actionCodeSettings);
      setSentEmail(email);
      setEmailSent(true);
      reset();
      toast.success('E-mail enviado com sucesso!', {
        position: 'top-center',
        duration: 4000,
      });
    } catch (err) {
      console.error('Erro ao enviar e-mail:', err);
      const errorMessage = getFriendlyError(err.code);
      toast.error(errorMessage, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-white dark:bg-gray-800 text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            E-mail Enviado!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enviamos um link de redefinição para <strong>{sentEmail}</strong>.
            Verifique sua caixa de entrada e a pasta de spam.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
                setSentEmail('');
              }}
              className="w-full py-2.5 px-4 rounded-md text-white bg-ollo-deep hover:bg-opacity-90 transition font-medium"
            >
              Enviar novo e-mail
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-white dark:bg-gray-800">
          <div className="text-center mb-6">
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              className="h-16 mx-auto rounded-full"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">
              Recuperação de Senha
            </h2>
          </div>

          <div className="flex justify-center mb-6">
            <EnvelopeIcon className="h-10 w-10 text-ollo-deep dark:text-ollo-accent-light" />
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
            Digite seu e-mail cadastrado e enviaremos um link seguro para
            redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Endereço de E-mail
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de e-mail inválido',
                  },
                })}
                className="w-full px-4 py-3 border rounded-md shadow-sm bg-white/70 dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors duration-150"
                placeholder="seu@email.com"
                autoComplete="email"
                inputMode="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-md text-white bg-ollo-deep hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center font-semibold"
            >
              {isSending ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Lembrou sua senha?{' '}
              <Link
                to="/login"
                className="font-medium text-ollo-deep dark:text-ollo-accent-light hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
