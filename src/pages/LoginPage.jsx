// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // MUDANÇA 1: Pega a função correta do AuthContext
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  // MUDANÇA 2: A função handleSubmit é reescrita para usar o login real
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      // O listener onAuthStateChanged no AuthContext vai detectar o login.
      // A lógica de redirecionamento agora viverá no componente que protege as rotas.
      // Por enquanto, após o login, ele vai para a home.
      navigate('/');
    } catch (err) {
      console.error('Erro no login:', err);
      toast.error('Email ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // O resto do seu JSX está ótimo, apenas o texto do botão é alterado.
  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <div
          className="w-full max-w-md p-6 sm:p-8 rounded-xl
                           bg-white/80 dark:bg-gray-800/80 
                           backdrop-blur-md shadow-xl dark:shadow-2xl 
                           border border-gray-200/30 dark:border-gray-700/50"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-3 tracking-tighter text-ollo-deep dark:text-ollo-accent-light">
            OLLO
          </h1>
          <p className="text-center text-sm mb-8 sm:mb-10 text-gray-700 dark:text-gray-300">
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                className="mt-1 block w-full px-4 py-3 sm:py-3.5 rounded-lg shadow-sm 
                                         bg-white/70 dark:bg-gray-700 
                                         text-black dark:text-white 
                                         border-gray-300 dark:border-gray-600 
                                         placeholder-gray-500 dark:placeholder-gray-400
                                         focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors duration-150"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 block w-full px-4 py-3 sm:py-3.5 rounded-lg shadow-sm
                                         bg-white/70 dark:bg-gray-700 
                                         text-black dark:text-white 
                                         border-gray-300 dark:border-gray-600 
                                         placeholder-gray-500 dark:placeholder-gray-400
                                         focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent outline-none transition-colors duration-150"
              />
            </div>

            <div className="flex justify-end items-center -mt-3 mb-2 sm:mb-0 sm:-mt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="group relative inline-flex items-center text-xs focus:outline-none"
                aria-label="Recuperar senha"
              >
                <EyeIcon
                  className="h-5 w-5 text-gray-500 group-hover:text-ollo-deep dark:text-gray-400 dark:group-hover:text-ollo-accent-light transition-colors duration-150"
                  aria-hidden="true"
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold shadow-lg opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10
                                             bg-gray-600 text-white dark:bg-gray-700 dark:text-ollo-light"
                  role="tooltip"
                >
                  Recuperar senha
                </span>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold transition-all duration-150
                                         bg-ollo-deep text-ollo-light hover:bg-opacity-90 
                                         dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90
                                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                                         focus:ring-ollo-deep dark:focus:ring-ollo-accent-light
                                         focus:ring-offset-white dark:focus:ring-offset-gray-900 flex justify-center items-center"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
          <p className="mt-8 sm:mt-10 text-center text-xs text-gray-700 dark:text-gray-300">
            Ainda não tem uma conta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-semibold text-ollo-deep hover:underline dark:text-ollo-accent-light dark:hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
        <footer className="text-center mt-8 sm:mt-12 text-xs text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} OLLO. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </>
  );
};

export default LoginPage;
