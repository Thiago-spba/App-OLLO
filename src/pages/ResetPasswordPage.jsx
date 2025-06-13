// src/pages/ResetPasswordPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [oobCode, setOobCode] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');

    if (code) {
      verifyPasswordResetCode(auth, code)
        .then(() => {
          setOobCode(code);
          setLoading(false);
        })
        .catch(() => {
          setError(
            'Link inválido ou expirado. Por favor, solicite uma nova redefinição.'
          );
          setLoading(false);
        });
    } else {
      setError('Código de redefinição não encontrado na URL.');
      setLoading(false);
    }
  }, [location.search]);

  const onSubmit = async (data) => {
    if (!oobCode) {
      setError('Erro: código de ação inválido. Tente novamente.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setSuccess(true);
    } catch (err) {
      setError(
        'Erro ao redefinir a senha. O link pode ter expirado ou a senha é muito fraca.'
      );
      setLoading(false);
    }
  };

  const password = watch('password');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link
          to="/forgot-password"
          className="px-4 py-2 bg-ollo-primary text-white rounded-md"
        >
          Solicitar Novo Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Senha Redefinida!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sua senha foi alterada com sucesso. Agora você já pode acessar sua
            conta com a nova senha.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-primary hover:bg-ollo-primary-dark"
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Redefinir sua Senha
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Crie uma nova senha forte para sua conta OLLO.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nova Senha
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'A nova senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter no mínimo 6 caracteres',
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-ollo-primary focus:ring-ollo-primary"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirme sua nova senha',
                  validate: (value) =>
                    value === watch('password') || 'As senhas não coincidem',
                })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-ollo-primary focus:ring-ollo-primary"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-primary hover:bg-ollo-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                  Salvando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
