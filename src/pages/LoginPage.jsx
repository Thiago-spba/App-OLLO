// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon } from '@heroicons/react/24/outline';

const LoginPage = ({ darkMode }) => {
    const [email, setEmail] = useState(''); // Mantido para não quebrar o input, mas não será usado no login direto
    const [password, setPassword] = useState(''); // Mantido para não quebrar o input, mas não será usado no login direto
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Loga diretamente com um usuário mock, ignorando os campos de email/senha para teste
            console.log('Tentando login direto para teste...');
            await login({ 
                email: 'testuser@ollo.com', 
                name: "Usuário Teste OLLO", 
                id: "usuario-teste-123" 
            });
            navigate('/'); // Redireciona para a HomePage após o login
        } catch (err) {
            console.error("Erro no login direto simulado:", err);
            setError('Falha ao tentar fazer login direto para teste.');
        }
    };

    // Classes de estilo (mantidas como na última versão)
    const containerClasses = darkMode 
        ? 'bg-gradient-to-br from-ollo-deep to-gray-900 text-ollo-bg-light' 
        : 'bg-gradient-to-br from-ollo-crystal-green to-ollo-sky-blue text-ollo-deep';
    
    const cardClasses = darkMode 
        ? 'bg-gray-800/80 backdrop-blur-md shadow-2xl border border-gray-700/50' 
        : 'bg-white/80 backdrop-blur-md shadow-xl border border-gray-200/30';

    const inputClasses = darkMode 
        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
        : 'bg-white/70 text-black border-gray-300 placeholder-gray-500';
    
    const buttonClasses = darkMode 
        ? 'bg-ollo-accent-light text-ollo-deep hover:bg-opacity-90' 
        : 'bg-ollo-deep text-ollo-bg-light hover:bg-opacity-90';
    
    const titleColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
    const textColor = darkMode ? 'text-gray-300' : 'text-gray-700';
    const linkColor = darkMode ? 'text-ollo-accent-light hover:underline' : 'text-ollo-deep hover:underline';
    const errorTextColor = darkMode ? 'text-red-400' : 'text-red-500';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${containerClasses} font-sans`}>
            <div className={`w-full max-w-md p-6 sm:p-8 rounded-xl ${cardClasses}`}>
                <h1 className={`text-4xl sm:text-5xl font-bold text-center mb-3 tracking-tighter ${titleColor}`}>
                    OLLO
                </h1>
                <p className={`text-center text-sm mb-8 sm:mb-10 ${textColor}`}> 
                    Acesse sua conta para continuar
                </p>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                        <label htmlFor="email" className={`block text-sm font-medium mb-1.5 ${textColor}`}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className={`mt-1 block w-full px-4 py-3 sm:py-3.5 rounded-lg shadow-sm focus:ring-2 ${inputClasses} ${darkMode ? 'focus:ring-ollo-accent-light' : 'focus:ring-ollo-deep'} focus:border-transparent outline-none transition-colors duration-150`}
                            // required // Não mais estritamente required para o login direto
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className={`block text-sm font-medium mb-1.5 ${textColor}`}>
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`mt-1 block w-full px-4 py-3 sm:py-3.5 rounded-lg shadow-sm focus:ring-2 ${inputClasses} ${darkMode ? 'focus:ring-ollo-accent-light' : 'focus:ring-ollo-deep'} focus:border-transparent outline-none transition-colors duration-150`}
                            // required // Não mais estritamente required para o login direto
                        />
                    </div>

                    <div className="flex justify-end items-center -mt-3 mb-2 sm:mb-0 sm:-mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                console.log('Botão "Esqueceu a senha?" clicado');
                                navigate('/forgot-password');
                            }}
                            className="group relative inline-flex items-center text-xs focus:outline-none"
                            aria-label="Recuperar senha"
                        >
                            <EyeIcon 
                                className={`h-5 w-5 transition-colors duration-150 ${darkMode ? 'text-gray-400 group-hover:text-ollo-accent-light' : 'text-gray-500 group-hover:text-ollo-deep'}`} 
                                aria-hidden="true" 
                            />
                            <span
                                className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold shadow-lg opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10
                                            ${darkMode ? 'bg-gray-700 text-ollo-bg-light' : 'bg-gray-600 text-white'}`}
                                role="tooltip"
                            >
                                Recuperar senha
                            </span>
                        </button>
                    </div>

                    {error && (
                        <p className={`text-sm ${errorTextColor} text-center py-1`}>{error}</p>
                    )}

                    <div className="pt-1">
                        <button
                            type="submit"
                            className={`w-full py-3 sm:py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold transition-all duration-150 ${buttonClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-900 focus:ring-ollo-accent-light' : 'focus:ring-offset-white focus:ring-ollo-deep'}`}
                        >
                            Entrar (Teste Direto) {/* Texto do botão alterado para clareza */}
                        </button>
                    </div>
                </form>
                <p className={`mt-8 sm:mt-10 text-center text-xs ${textColor}`}>
                    Ainda não tem uma conta?{' '}
                    <button onClick={() => navigate('/register')} className={`font-semibold ${linkColor}`}>
                        Cadastre-se
                    </button>
                </p>
            </div>
             <footer className={`text-center mt-8 sm:mt-12 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>&copy; {new Date().getFullYear()} OLLO. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default LoginPage;