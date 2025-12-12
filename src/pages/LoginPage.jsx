// src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast'; // Importação correta
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  parseAuthError,
  checkForCorsPotentialIssues,
} from '../utils/authErrorHandler';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCorsWarning, setShowCorsWarning] = useState(false);

  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectedFrom = location.state?.redirectedFrom || '/';

  useEffect(() => {
    if (import.meta.env.DEV && checkForCorsPotentialIssues()) {
      setShowCorsWarning(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // MUDANÇA 1: Limpa toasts anteriores para evitar acumulo visual
    toast.dismiss();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithEmail(email, password);

      if (result && result.success && result.user) {
        toast.success('Bem-vindo de volta!');
        // Pequeno delay para o usuário ler o sucesso antes de mudar de tela
        setTimeout(() => {
          navigate(redirectedFrom, { replace: true });
        }, 500);
      } else {
        // CORREÇÃO DE ERRO: Tratamento específico para o erro genérico do Firebase
        const errorCode = result.error?.code || result.error?.message || '';

        // Log para debug (apenas em desenvolvimento)
        console.error('[OLLO DEBUG] Erro Login:', result.error);

        let displayMessage = '';

        // MUDANÇA 2: Tradução manual forçada para os erros mais comuns
        if (
          errorCode.includes('auth/invalid-login-credentials') ||
          errorCode.includes('auth/invalid-credential')
        ) {
          displayMessage = 'E-mail ou senha incorretos.';
        } else if (errorCode.includes('auth/too-many-requests')) {
          displayMessage =
            'Muitas tentativas falhas. Tente novamente mais tarde.';
        } else if (errorCode.includes('auth/user-not-found')) {
          displayMessage = 'Usuário não encontrado. Crie uma conta.';
        } else {
          // Fallback para o seu utilitário existente se não for um dos acima
          const errorInfo = parseAuthError(result.error);
          displayMessage = errorInfo.message;

          // Verificação de CORS
          if (
            errorInfo.code === 'auth/cors-error' ||
            errorInfo.code === 'auth/requests-from-referer-are-blocked'
          ) {
            setShowCorsWarning(true);
          }
        }

        toast.error(displayMessage);
      }
    } catch (error) {
      // Catch genérico para erros de rede ou código
      console.error('[OLLO] Erro Crítico:', error);
      toast.error('Ocorreu um erro inesperado. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            {/* Logo placeholder se a imagem falhar */}
            <div className="h-16 w-16 mx-auto mb-3 rounded-full shadow bg-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src="/images/logo_ollo.jpeg"
                alt="Logo OLLO"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerText = 'OLLO';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Acesse sua conta
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Entre para continuar no OLLOAPP
            </p>
          </div>

          {showCorsWarning && (
            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Aviso de Desenvolvimento (CORS)
                </span>
              </div>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                Se o login falhar, verifique se 'localhost' está autorizado no
                Firebase Console.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-primary outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-primary outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-ollo-primary focus:ring-ollo-primary border-gray-300 rounded cursor-pointer"
                />
                Lembrar-me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-ollo-primary hover:underline dark:text-blue-400"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Verificando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 border-t pt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            Novo no OLLO?{' '}
            <Link
              to="/register"
              className="text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              Criar uma conta
            </Link>
          </div>
        </div>

        <footer className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} OLLO. Todos os direitos reservados.
        </footer>
      </div>
    </>
  );
};

export default LoginPage;
