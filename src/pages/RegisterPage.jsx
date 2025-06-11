// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

function RegisterPage() {
  const navigate = useNavigate();
  // MUDANÇA 1: Pega também a função de logout
  const { registerWithEmail, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameTooltipVisible, setIsUsernameTooltipVisible] =
    useState(false);

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
        // MUDANÇA 2: Desloga o usuário para forçar o fluxo de verificação
        await logout();
        navigate('/verify-email');
      }
    } catch (error) {
      toast.error(
        error.code === 'auth/email-already-in-use'
          ? 'Este email já está cadastrado.'
          : 'Ocorreu um erro no cadastro. Tente novamente.',
        {
          duration: 4000,
          position: 'top-center',
          style: { background: '#FFF0F0', color: '#D92D20' },
        }
      );
    } finally {
      setIsLoading(false);
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
            {/* O resto do JSX permanece igual */}
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
