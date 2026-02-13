// src/pages/ForgotPasswordPage.jsx
// ATUALIZAÇÃO: Integração com Cloud Function para envio de e-mail personalizado OLLO

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

// MUDANÇA: Importamos as ferramentas para chamar nossa Cloud Function
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config'; // Importamos 'app' para inicializar functions

import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
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

  // Inicializa o serviço de Funções do Firebase
  const functions = getFunctions(app, 'southamerica-east1');

  const onSubmit = async ({ email }) => {
    setIsSending(true);

    try {
      // MUDANÇA: Chamada à nossa Cloud Function Personalizada
      const sendResetEmail = httpsCallable(
        functions,
        'sendBrevoPasswordResetEmail'
      );

      // Enviamos o e-mail para o backend processar e enviar via Brevo com nosso template bonito
      await sendResetEmail({ email });

      setSentEmail(email);
      setEmailSent(true);
      reset();

      toast.success('Link enviado com sucesso!', {
        position: 'top-center',
        duration: 4000,
        style: {
          background: '#064e3b',
          color: '#fff',
        },
      });
    } catch (err) {
      console.error('Erro ao enviar:', err);

      let errorMessage = 'Erro ao conectar com o servidor.';

      // Tratamento de erros comuns
      if (err.message.includes('internal')) {
        // Mesmo erro interno, às vezes é melhor não assustar o usuário
        errorMessage =
          'Houve um problema no envio. Tente novamente em instantes.';
      }

      toast.error(errorMessage, {
        position: 'top-center',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-white dark:bg-gray-800 text-center border border-gray-200 dark:border-gray-700">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Verifique seu E-mail
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enviamos um link seguro de recuperação com o visual{' '}
            <strong>OLLO</strong> para <strong>{sentEmail}</strong>.
            <br />
            <br />
            <span className="text-sm text-yellow-600 dark:text-yellow-500 font-bold">
              Não esqueça de olhar a caixa de Spam!
            </span>
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
                setSentEmail('');
              }}
              className="w-full py-2.5 px-4 rounded-md text-white bg-[#0D4D44] hover:bg-opacity-90 transition font-medium shadow-md"
            >
              Tentar outro e-mail
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
        <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Detalhe visual de fundo (opcional) */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#a8edea] to-[#45c486]"></div>

          <div className="text-center mb-6">
            <img
              src="/images/logo_ollo.jpeg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              alt="Logo OLLO"
              className="h-20 mx-auto rounded-full mb-4 shadow-md border-2 border-[#45c486]"
            />
            <h2 className="text-2xl font-bold mt-2 text-[#0D4D44] dark:text-white">
              Recuperar Senha
            </h2>
            <p className="text-xs text-yellow-600 font-bold tracking-widest uppercase mt-1">
              Explore. Conecte. Negocie.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <EnvelopeIcon className="h-12 w-12 text-[#0D4D44] opacity-80" />
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6 px-2">
            Digite seu e-mail cadastrado e enviaremos um link exclusivo para
            você criar uma nova senha.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                E-mail Cadastrado
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de e-mail inválido',
                  },
                })}
                className="w-full px-4 py-3 border rounded-md shadow-sm bg-white/70 dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#0D4D44] outline-none transition-all"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-md text-white bg-[#0D4D44] hover:bg-[#093630] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center font-semibold text-lg shadow-md"
            >
              {isSending ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Link Seguro'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Lembrou sua senha?{' '}
              <Link
                to="/login"
                className="font-bold text-[#0D4D44] hover:underline"
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
