// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/**
 * @fileoverview LoginPage - Padrão OLLO - Versão Simplificada e Correta.
 *
 * @description
 * Esta página agora tem uma única responsabilidade: autenticar o usuário.
 *
 * @architecture
 * 1. Ela chama a função `loginWithEmail` do AuthContext.
 * 2. Se o login for bem-sucedido (`result.success === true`), ela não faz mais
 *    nenhuma verificação. Ela simplesmente redireciona o usuário para a rota
 *    raiz (`/`) ou para a página de onde ele veio.
 * 3. A partir daí, a arquitetura de rotas e os guardiões (`RequireVerifiedEmail`)
 *    assumem o controle para decidir se o usuário pode acessar a página ou se
 *    deve ser enviado para a tela de verificação de e-mail.
 * 4. Toda a lógica duplicada de `reload()` e `emailVerified` foi removida.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se o usuário veio de uma rota protegida, vamos mandá-lo de volta para lá após o login.
  // Caso contrário, o destino padrão é a página inicial.
  const redirectedFrom = location.state?.redirectedFrom || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tenta fazer o login.
      const result = await loginWithEmail(email, password);

      // 2. Se o login foi bem-sucedido, apenas navega.
      if (result.success) {
        toast.success('Login bem-sucedido! Redirecionando...');
        navigate(redirectedFrom, { replace: true });
      } else {
        // Se `loginWithEmail` já mostrou um toast de erro, não precisamos de outro.
        // Se a função `loginWithEmail` não retornou sucesso, o erro já foi tratado lá.
        // O `toast.error` no `catch` lidará com erros inesperados.
      }
    } catch (err) {
      // Este catch é uma segurança para erros inesperados que podem não ser
      // tratados dentro da função de login.
      console.error('Erro inesperado no handleSubmit do login:', err);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              className="h-16 w-16 mx-auto mb-3 rounded-full shadow"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Acesse sua conta
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Entre para continuar no OLLOAPP
            </p>
          </div>

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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-primary outline-none"
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
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ollo-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-ollo-primary focus:ring-ollo-primary border-gray-300 rounded"
                />
                Lembrar-me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-ollo-primary hover:underline dark:text-ollo-accent-light"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-ollo-primary hover:bg-opacity-90 text-white font-semibold dark:bg-ollo-accent-light dark:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />{' '}
                  Entrando...
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
              className="text-ollo-primary dark:text-ollo-accent-light font-medium hover:underline"
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
