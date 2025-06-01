import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = ({ darkMode }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
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

  const pageClasses = darkMode
    ? 'bg-gradient-to-br from-ollo-deep to-gray-900'
    : 'bg-gradient-to-br from-white via-ollo-bg-light to-ollo-crystal-green/40';
  const cardClasses = darkMode
    ? 'bg-gray-800/90 backdrop-blur-md text-ollo-bg-light shadow-2xl'
    : 'bg-ollo-bg-light/80 backdrop-blur-lg text-slate-800 shadow-2xl';
  
  // Estilo para o logo "OLLO"
  const logoTextClasses = darkMode
    ? 'text-5xl font-bold text-ollo-accent-light tracking-wider'
    : 'text-5xl font-bold text-ollo-deep tracking-wider';

  const titleClasses = `text-2xl sm:text-3xl font-bold text-center ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep'}`;
  const textMutedClasses = darkMode ? 'text-slate-400' : 'text-slate-600';
  const labelClasses = darkMode ? 'text-gray-300 font-medium' : 'text-slate-700 font-medium';
  const inputBaseClasses = 'mt-1 block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none sm:text-sm';
  const inputClasses = darkMode
    ? `${inputBaseClasses} bg-slate-700 border-slate-600 text-ollo-bg-light placeholder-slate-400 focus:border-ollo-accent-light focus:ring-1 focus:ring-ollo-accent-light`
    : `${inputBaseClasses} bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-ollo-deep focus:ring-1 focus:ring-ollo-deep`;

  const buttonClasses = `w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    loading
      ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed' )
      : (darkMode 
          ? 'bg-ollo-accent-light text-ollo-deep hover:bg-ollo-accent-light/90 focus:ring-ollo-accent-light focus:ring-offset-gray-800' 
          : 'bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90 focus:ring-ollo-deep focus:ring-offset-ollo-bg-light'
        )
  }`;
  
  const errorClasses = darkMode
    ? 'bg-red-900/50 text-red-200 border border-red-700/70'
    : 'bg-red-50 text-red-700 border border-red-200';

  const linkClasses = darkMode
    ? `font-medium text-ollo-accent-light hover:text-opacity-80 underline`
    : `font-medium text-ollo-deep hover:text-opacity-80 underline`;

  const successIconClasses = darkMode ? 'text-green-400' : 'text-green-500';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pageClasses} selection:bg-ollo-deep/30 selection:text-ollo-deep`}>
      <div className={`w-full max-w-md p-7 sm:p-10 space-y-6 rounded-xl ${cardClasses}`}>
        
        {!isSubmitted ? (
          // --------- VISTA DO FORMULÁRIO INICIAL ---------
          <>
            <div className="text-center">
              {/* LOGO OLLO ADICIONADO AQUI */}
              <div className={`mb-6 ${logoTextClasses}`}>
                OLLO
              </div>
              <EnvelopeIcon className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep'}`} />
              <h2 className={titleClasses}>Recuperar Senha</h2>
              <p className={`mt-2 text-sm ${textMutedClasses}`}>
                Sem problemas! Digite seu email abaixo e enviaremos um link para você voltar a acessar sua conta Ollo.
              </p>
            </div>

            {error && (
              <div className={`p-3.5 rounded-lg text-sm ${errorClasses}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
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
              <Link to="/login" className={linkClasses}>
                Voltar para o Login
              </Link>
            </p>
          </>
        ) : (
          // --------- VISTA DA MENSAGEM DE SUCESSO/INSTRUÇÃO (PÓS-SUBMISSÃO) ---------
          <div className="text-center space-y-4 py-4">
            {/* LOGO OLLO ADICIONADO AQUI TAMBÉM PARA CONSISTÊNCIA (OPCIONAL) */}
            <div className={`mb-6 ${logoTextClasses}`}>
                OLLO
            </div>
            <CheckCircleIcon className={`w-16 h-16 mx-auto ${successIconClasses}`} />
            <h2 className={titleClasses}>Link Enviado!</h2>
            <p className={`text-sm ${textMutedClasses}`}>
              Se o email <strong className={darkMode ? 'text-ollo-accent-light/90' : 'text-ollo-deep/90'}>{email}</strong> estiver cadastrado em nosso sistema, 
              você receberá as instruções para redefinir sua senha em breve.
            </p>
            <p className={`text-xs ${textMutedClasses}`}>
              (Não se esqueça de verificar sua pasta de spam ou lixo eletrônico).
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