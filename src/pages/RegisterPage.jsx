// src/pages/RegisterPage.jsx
// Versão COMPLETA, FINAL e CORRIGIDA. A lógica de tratamento de erro agora funciona corretamente.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerWithEmail } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // A sua função de tratamento de erros já está ótima, não precisa mudar.
  const getFriendlyError = (error) => {
    const errorCode = error?.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso. Tente outro.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido.';
      case 'auth/weak-password':
        return 'Senha muito fraca. Use no mínimo 6 caracteres.';
      default:
        // Mensagem de fallback, caso o erro não seja reconhecido
        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const additionalData = {
        name: `${data.firstName} ${data.lastName}`,
        username: data.username.toLowerCase(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.firstName + ' ' + data.lastName
        )}&background=0D4D44&color=fff&bold=true`,
        bio: 'Novo membro da comunidade OLLO!',
      };

      const result = await registerWithEmail(
        data.email,
        data.password,
        additionalData
      );

      // ========================= AQUI ESTÁ A ÚNICA ALTERAÇÃO =========================
      // Antes: "throw result.error;" que ia para o bloco catch
      // Agora: Checamos se o 'result' falhou e, se sim, usamos diretamente
      // a sua função getFriendlyError para mostrar a mensagem certa no toast.

      if (result.success) {
        toast.success(
          'Conta criada! Um e-mail de verificação da OLLO foi enviado para você.',
          { duration: 8000 }
        );
        reset();
        navigate('/verify-email');
      } else {
        // Se a criação da conta falhou, obtemos a mensagem amigável e a exibimos.
        const errorMessage = getFriendlyError(result.error);
        toast.error(errorMessage, { duration: 7000 });
      }
      // ==============================================================================
    } catch (error) {
      // Este bloco catch agora serve para erros verdadeiramente inesperados,
      // como problemas de rede, garantindo que o app não quebre.
      console.error('Erro inesperado durante o registro:', error);
      toast.error('Ocorreu um erro inesperado. Verifique sua conexão.', {
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-lg p-4 sm:p-6 lg:p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Junte-se à Comunidade OLLO
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Crie sua conta para começar a explorar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* O RESTANTE DO SEU FORMULÁRIO PERMANECE IDÊNTICO, NENHUMA MUDANÇA É NECESSÁRIA AQUI. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                {' '}
                {/* First Name */}
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <input
                  {...register('firstName', {
                    required: 'Nome é obrigatório',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  })}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="Seu nome"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                {' '}
                {/* Last Name */}
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Sobrenome
                </label>
                <input
                  {...register('lastName', {
                    required: 'Sobrenome é obrigatório',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  })}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="Seu sobrenome"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              {' '}
              {/* Username */}
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nome de usuário
              </label>
              <input
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  pattern: {
                    value: /^[a-z0-9_.]+$/,
                    message: 'Apenas letras minúsculas, números, . ou _',
                  },
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                })}
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                placeholder="ex: ana.silva"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              {' '}
              {/* Email */}
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de e-mail inválido',
                  },
                })}
                className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              {' '}
              {/* Password */}
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              {' '}
              {/* Confirm Password */}
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirmar Senha
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirme sua senha',
                    validate: (value) =>
                      value === watch('password') || 'As senhas não coincidem',
                  })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 dark:focus:ring-ollo-accent-light outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-gray-900 font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
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

export default RegisterPage;
