// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // A função de login do Firebase retorna o userCredential
      const userCredential = await loginWithEmail(email, password);
      const firebaseUser = userCredential.user;

      // Verificação IMEDIATA após o login
      if (firebaseUser.emailVerified) {
        // Se o e-mail for verificado, vai para a home.
        navigate('/');
      } else {
        // Se NÃO for verificado, vai para a página de verificação.
        navigate('/verify-email');
      }
    } catch (err) {
      toast.error('Email ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Link
                to="/forgot-password"
                className="text-xs text-gray-600 hover:underline dark:text-gray-400"
              >
                Esqueceu a senha?
              </Link>
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
            <Link
              to="/register"
              className="font-semibold text-ollo-deep hover:underline dark:text-ollo-accent-light dark:hover:underline"
            >
              Cadastre-se
            </Link>
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
