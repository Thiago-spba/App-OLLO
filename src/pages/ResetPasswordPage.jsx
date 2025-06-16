// Versão Corrigida - 2025-06-16

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

  // Função para traduzir erros do Firebase
  const getFriendlyError = (errorCode) => {
    switch (errorCode) {
      case 'auth/expired-action-code':
        return 'Link expirado. Solicite uma nova redefinição.';
      case 'auth/invalid-action-code':
        return 'Código inválido ou já utilizado.';
      case 'auth/user-disabled':
        return 'Esta conta está desativada.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/weak-password':
        return 'Senha muito fraca (mínimo 6 caracteres).';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  // Verifica o código de redefinição na URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('oobCode');

    if (!code) {
      setError('Link inválido. Utilize o link recebido por e-mail.');
      setLoading(false);
      navigate('/forgot-password', { state: { error: 'invalid_link' } });
      return;
    }

    setLoading(true);

    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setOobCode(code);
        setEmail(email);
        toast.success(`Redefinindo senha para: ${email}`);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro na verificação:', error);
        const friendlyError = getFriendlyError(error.code);
        setError(friendlyError);
        toast.error(friendlyError);
        setLoading(false);
        navigate('/forgot-password', { state: { error: error.code } });
      });
  }, [location.search, navigate]);

  const onSubmit = async (data) => {
    if (!oobCode) {
      toast.error('Código de redefinição inválido.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      toast.success('Senha alterada com sucesso!');
      setSuccess(true);

      // Redireciona após 3 segundos
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { email, passwordReset: true },
        });
      }, 3000);
    } catch (error) {
      console.error('Erro na redefinição:', error);
      const friendlyError = getFriendlyError(error.code);
      setError(friendlyError);
      toast.error(friendlyError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-ollo-deep" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Verificando o link de redefinição...
          </p>
        </div>
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
            Sua senha foi alterada com sucesso para a conta{' '}
            <strong>{email}</strong>.
          </p>
          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Você será redirecionado automaticamente...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              className="h-16 mx-auto rounded-full"
            />
            <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
              Redefinir Senha
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Para: <span className="font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none bg-white/70 dark:bg-gray-700 text-black dark:text-white pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirme sua nova senha',
                  validate: (value) =>
                    value === password || 'As senhas não coincidem',
                })}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none bg-white/70 dark:bg-gray-700 text-black dark:text-white pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-9 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !oobCode}
              className="w-full bg-ollo-deep text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lembrou sua senha?{' '}
              <Link
                to="/login"
                className="font-medium text-ollo-deep hover:text-opacity-80"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
