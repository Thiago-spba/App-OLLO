import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const { registerWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUsernameTooltipVisible, setIsUsernameTooltipVisible] =
    useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const getFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso. Tente recuperar sua conta ou use outro e-mail.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido. Verifique e tente novamente.';
      case 'auth/weak-password':
        return 'Senha muito fraca. Use no mínimo 6 caracteres.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro no cadastro. Tente novamente.';
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    const additionalData = {
      name: `${data.firstName} ${data.lastName}`,
      username: data.username.toLowerCase(),
    };

    try {
      const result = await registerWithEmail(
        data.email,
        data.password,
        additionalData
      );

      if (result.success) {
        setRegistrationSuccess(true);
        reset();
        toast.success('Verifique seu e-mail para ativar sua conta!', {
          duration: 6000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getFriendlyError(error.code);
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Cadastro Concluído!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enviamos um link de verificação para seu e-mail. Confirme sua conta
            para começar a usar o OLLO.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded-md bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-gray-900 font-medium hover:bg-opacity-90 transition"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-lg p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              className="h-16 mx-auto rounded-full mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Junte-se à Comunidade OLLO
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Crie sua conta para começar a explorar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nome
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres',
                    },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors"
                  placeholder="Seu nome"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Sobrenome
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', {
                    required: 'Sobrenome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Sobrenome deve ter pelo menos 2 caracteres',
                    },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors"
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nome de usuário
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setIsUsernameTooltipVisible(!isUsernameTooltipVisible)
                  }
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Mostrar regras para nome de usuário"
                >
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
              </div>
              <input
                id="username"
                type="text"
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  pattern: {
                    value: /^[a-z0-9_.]+$/,
                    message:
                      'Use apenas letras minúsculas, números, ponto ou underline',
                  },
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Máximo 20 caracteres',
                  },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors"
                placeholder="ex: maria.silva"
                autoComplete="username"
              />
              {isUsernameTooltipVisible && (
                <div className="absolute z-10 mt-2 w-full p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" />
                    <div>
                      <p className="font-semibold mb-1">
                        Regras para nome de usuário:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>3-20 caracteres</li>
                        <li>Letras minúsculas (a-z) e números (0-9)</li>
                        <li>Ponto (.) ou underline (_) permitidos</li>
                        <li>Exemplos: ana.silva, joao_2023</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                E-mail
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors"
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

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-10 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirme sua senha',
                  validate: (value) =>
                    value === watch('password') || 'As senhas não coincidem',
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-10 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={
                  showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
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
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
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
