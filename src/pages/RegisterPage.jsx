// src/pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ReactConfetti from 'react-confetti';

// Removido o prop `darkMode`, pois o Tailwind agora gerencia isso com a classe 'dark'
const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.email !== formData.confirmEmail) {
      setError('Os emails não coincidem.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (isNaN(formData.age) || Number(formData.age) <= 0) {
      setError('Por favor, insira uma idade válida.');
      return;
    }

    setLoading(true);
    console.log('Dados do formulário de cadastro:', formData);

    setTimeout(() => {
      setLoading(false);
      setShowConfetti(true); 
      setTimeout(() => {
        navigate('/');      
      }, 5000); 
    }, 1000); 
  };

  const inputClasses = `
    mt-1 block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-150
    bg-white/70 dark:bg-slate-700
    border-slate-300 dark:border-slate-600
    text-slate-900 dark:text-ollo-light
    placeholder-slate-400 dark:placeholder-slate-400
    focus:border-ollo-deep dark:focus:border-ollo-accent-light
    focus:ring-1 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light
  `;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-ollo-deep/30 selection:text-ollo-deep">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.08}
          wind={0.01}
          initialVelocityX={{ min: -8, max: 8 }}
          initialVelocityY={{ min: -12, max: 8 }}
          confettiSource={{ x: windowSize.width / 2, y: -50, w: windowSize.width, h: 0 }}
          tweenDuration={10000}
        />
      )}
      <div className="w-full max-w-lg p-7 sm:p-10 space-y-6 rounded-xl 
                    bg-ollo-light/70 dark:bg-gray-800/90 
                    text-slate-800 dark:text-ollo-light 
                    backdrop-blur-lg shadow-2xl">
        
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          <span className="text-ollo-deep dark:text-ollo-accent-light">Criar Conta </span> 
          <span className="font-semibold text-ollo-deep dark:text-ollo-accent-light">OLLO</span>
        </h2>

        {error && (
          <div className="p-3.5 rounded-lg text-sm 
                        bg-red-50 text-red-700 border border-red-200
                        dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label htmlFor="firstName" className="text-slate-700 dark:text-gray-300 font-medium">Nome</label>
              <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className={inputClasses} placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="lastName" className="text-slate-700 dark:text-gray-300 font-medium">Sobrenome</label>
              <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className={inputClasses} placeholder="Seu sobrenome" />
            </div>
          </div>

          <div>
            <label htmlFor="age" className="text-slate-700 dark:text-gray-300 font-medium">Idade</label>
            <input id="age" name="age" type="number" required value={formData.age} onChange={handleChange} className={inputClasses} placeholder="Sua idade" />
          </div>

          <div>
            <label htmlFor="email" className="text-slate-700 dark:text-gray-300 font-medium">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputClasses} placeholder="voce@exemplo.com" />
          </div>

          <div>
            <label htmlFor="confirmEmail" className="text-slate-700 dark:text-gray-300 font-medium">Confirmar Email</label>
            <input id="confirmEmail" name="confirmEmail" type="email" autoComplete="email" required value={formData.confirmEmail} onChange={handleChange} className={inputClasses} placeholder="Confirme seu email" />
          </div>

          <div>
            <label htmlFor="password" className="text-slate-700 dark:text-gray-300 font-medium">Senha</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={inputClasses} placeholder="••••••••"/>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-ollo-deep dark:text-gray-400 dark:hover:text-ollo-accent-light" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-slate-700 dark:text-gray-300 font-medium">Confirmar Senha</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={inputClasses} placeholder="••••••••"/>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-ollo-deep dark:text-gray-400 dark:hover:text-ollo-accent-light" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="referralCode" className="text-slate-700 dark:text-gray-300 font-medium">
              Código de Indicação <span className="text-xs font-normal">(Opcional)</span>
            </label>
            <input id="referralCode" name="referralCode" type="text" value={formData.referralCode} onChange={handleChange} className={inputClasses} placeholder="Código recebido"/>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150
                          ${loading 
                            ? 'bg-slate-300 text-slate-500 dark:bg-slate-600 dark:text-slate-400 cursor-not-allowed' 
                            : 'bg-ollo-deep text-ollo-light hover:bg-opacity-90 focus:ring-ollo-deep focus:ring-offset-ollo-bg-light dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90 dark:focus:ring-ollo-accent-light dark:focus:ring-offset-gray-800'
                          }`}
            >
              {loading ? 'Concluindo Registro...' : 'Concluir Registro'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-ollo-deep hover:text-opacity-80 underline dark:text-ollo-accent-light dark:hover:text-opacity-80">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;