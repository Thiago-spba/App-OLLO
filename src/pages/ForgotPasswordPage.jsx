// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Removido o prop `darkMode`, não é mais necessário
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, insira seu endereço de email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um endereço de email válido.');
      return;
    }

    setLoading(true);
    console.log('Email para recuperação:', email);

    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  // Classe de input reutilizável com modificadores `dark:`
  const inputClasses = `
    mt-1 block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-150
    bg-white dark:bg-slate-700
    border-slate-300 dark:border-slate-600
    text-slate-900 dark:text-ollo-light
    placeholder-slate-400 dark:placeholder-slate-400
    focus:border-ollo-deep dark:focus:border-ollo-accent-light
    focus:ring-1 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light
  `;

  // Classe de botão reutilizável com modificadores `dark:`
  const buttonClasses = `
    w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150
    ${loading
      ? 'bg-slate-300 text-slate-500 dark:bg-slate-600 dark:text-slate-400 cursor-not-allowed'
      : 'bg-ollo-deep text-ollo-light hover:bg-opacity-90 focus:ring-ollo-deep focus:ring-offset-white dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90 dark:focus:ring-ollo-accent-light dark:focus:ring-offset-gray-800'
    }
  `;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-ollo-deep/30 selection:text-ollo-deep">
      <div className="w-full max-w-md p-7 sm:p-10 space-y-6 rounded-xl
                      bg-ollo-light/80 dark:bg-gray-800/90
                      text-slate-800 dark:text-ollo-light
                      backdrop-blur-lg shadow-2xl">
        
        {!isSubmitted ? (
          // --------- VISTA DO FORMULÁRIO INICIAL ---------
          <>
            <div className="text-center">
              <div className="mb-6 text-5xl font-bold tracking-wider text-ollo-deep dark:text-ollo-accent-light">
                OLLO
              </div>
              <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-ollo-deep dark:text-ollo-accent-light" />
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-ollo-deep dark:text-ollo-accent-light">Recuperar Senha</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Sem problemas! Digite seu email abaixo e enviaremos um link para você voltar a acessar sua conta Ollo.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg text-sm
                            bg-red-50 text-red-700 border border-red-200
                            dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="text-slate-700 dark:text-gray-300 font-medium">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className={buttonClasses}>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </button>
              </div>
            </form>

            <p className="mt-8 text-sm text-center">
              Lembrou a senha?{' '}
              <Link to="/login" className="font-medium text-ollo-deep hover:text-opacity-80 underline dark:text-ollo-accent-light dark:hover:text-opacity-80">
                Voltar para o Login
              </Link>
            </p>
          </>
        ) : (
          // --------- VISTA DA MENSAGEM DE SUCESSO ---------
          <div className="text-center space-y-4 py-4">
            <div className="mb-6 text-5xl font-bold tracking-wider text-ollo-deep dark:text-ollo-accent-light">
                OLLO
            </div>
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 dark:text-green-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-ollo-deep dark:text-ollo-accent-light">Link Enviado!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Se o email <strong className="text-ollo-deep/90 dark:text-ollo-accent-light/90">{email}</strong> estiver cadastrado, 
              você receberá as instruções em breve.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              (Verifique sua pasta de spam).
            </p>
            <div className="pt-4">
              <Link to="/login" className={buttonClasses}>
                Voltar para o Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;