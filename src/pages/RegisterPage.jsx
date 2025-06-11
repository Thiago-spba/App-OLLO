// src/pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const registerWithEmail = useAuthStore((state) => state.registerWithEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);

  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameTooltipVisible, setIsUsernameTooltipVisible] =
    useState(false);

  useEffect(() => {
    if (authError) {
      toast.error(
        authError.includes('email-already-in-use')
          ? 'Este email já está cadastrado.'
          : 'Ocorreu um erro no cadastro.',
        {
          duration: 4000,
          position: 'top-center',
          style: { background: '#FFF0F0', color: '#D92D20' },
        }
      );
    }
  }, [authError]);

  const onSubmit = async (data) => {
    const additionalData = {
      name: `${data.firstName} ${data.lastName}`,
      username: data.username.toLowerCase(),
    };
    const result = await registerWithEmail(
      data.email,
      data.password,
      additionalData
    );

    if (result.success) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Conta criada com sucesso!
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enviamos um link para <b>{data.email}</b>. Por favor,
                    verifique sua caixa de entrada e spam para confirmar sua
                    conta.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-ollo-accent hover:text-ollo-deep focus:outline-none focus:ring-2 focus:ring-ollo-accent"
              >
                Fechar
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: 'top-center',
        }
      );
      setTimeout(() => navigate('/login'), 5000);
    }
  };

  const password = watch('password');

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-lg p-7 sm:p-10 space-y-6 rounded-xl bg-white/80 dark:bg-gray-800/90 text-slate-800 dark:text-ollo-light backdrop-blur-lg shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-ollo-deep dark:text-ollo-accent-light">
            Criar Conta OLLO
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <label htmlFor="firstName" className="label-style">
                  Nome
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', { required: 'Nome é obrigatório' })}
                  className="input-field"
                  placeholder="Seu nome"
                />
                {errors.firstName && (
                  <p className="error-message">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="label-style">
                  Sobrenome
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', {
                    required: 'Sobrenome é obrigatório',
                  })}
                  className="input-field"
                  placeholder="Seu sobrenome"
                />
                {errors.lastName && (
                  <p className="error-message">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <label htmlFor="username" className="label-style">
                Nome de Usuário
              </label>
              <input
                id="username"
                type="text"
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  pattern: {
                    value: /^[a-z0-9_.]+$/,
                    message: 'Formato inválido. Veja as regras.',
                  },
                })}
                className="input-field"
                placeholder="ex: seu_nome.123"
                onFocus={() => setIsUsernameTooltipVisible(true)}
                onBlur={() => setIsUsernameTooltipVisible(false)}
              />
              {isUsernameTooltipVisible && (
                <div className="absolute bottom-full left-0 mb-2 w-full p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" />
                    <div>
                      <p className="font-semibold mb-1">
                        Regras para nome de usuário:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Apenas letras minúsculas (a-z) e números (0-9).</li>
                        <li>Pode conter ponto (.) ou sublinhado (_).</li>
                        <li className="mt-1">
                          <strong>Exemplos:</strong> `ana.silva`, `joao_1995`,
                          `ollo_user`
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {errors.username && (
                <p className="error-message">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label-style">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Formato de email inválido',
                  },
                })}
                className="input-field"
                placeholder="voce@exemplo.com"
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password" className="label-style">
                Senha
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter no mínimo 6 caracteres',
                  },
                })}
                className="input-field"
                placeholder="••••••••"
              />
              <span
                className="absolute top-8 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </span>
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-style">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirme sua senha',
                  validate: (value) =>
                    value === password || 'As senhas não coincidem',
                })}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="error-message">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="button-primary w-full"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                    Concluindo Registro...
                  </>
                ) : (
                  'Concluir Registro'
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-center">
            Já tem uma conta?{' '}
            <Link to="/login" className="link-primary">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
