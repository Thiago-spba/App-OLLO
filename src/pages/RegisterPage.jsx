import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ReactConfetti from 'react-confetti';

const RegisterPage = ({ darkMode }) => {
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
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

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

    // ... (validações como antes) ...
    if (formData.email !== formData.confirmEmail) {
      setError('Os emails não coincidem.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.email || !formData.confirmEmail || !formData.password || !formData.confirmPassword) {
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

      // Aumentando o tempo para os confetes serem visíveis
      const navigationTimer = setTimeout(() => {
        setShowConfetti(false); 
        navigate('/');      
      }, 5000); // <<---- TEMPO AUMENTADO PARA 5 SEGUNDOS de confetes visíveis

      return () => clearTimeout(navigationTimer);
    }, 1000); 
  };

  // --- Definições de Estilo OLLO (sem alterações aqui) ---
  const pageClasses = darkMode
    ? 'bg-gradient-to-br from-ollo-deep to-gray-900'
    : 'bg-gradient-to-br from-white via-ollo-bg-light to-ollo-crystal-green/40';
  const cardClasses = darkMode
    ? 'bg-gray-800/90 backdrop-blur-md text-ollo-bg-light shadow-2xl'
    : 'bg-ollo-bg-light/70 backdrop-blur-lg text-slate-800 shadow-2xl';
  const titleMainTextClasses = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
  const titleOLLOTextClasses = darkMode ? 'text-ollo-accent-light font-semibold' : 'text-ollo-deep font-semibold';
  const labelClasses = darkMode ? 'text-gray-300 font-medium' : 'text-slate-700 font-medium';
  const inputBaseClasses = 'mt-1 block w-full px-3 py-2.5 border rounded-md shadow-sm focus:outline-none sm:text-sm';
  const inputClasses = darkMode
    ? `${inputBaseClasses} bg-slate-700 border-slate-600 text-ollo-bg-light placeholder-slate-400 focus:border-ollo-accent-light focus:ring-1 focus:ring-ollo-accent-light`
    : `${inputBaseClasses} bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-ollo-deep focus:ring-1 focus:ring-ollo-deep`;
  const passwordInputWrapperClasses = "relative";
  const passwordInputIconClasses = `absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${darkMode ? 'text-gray-400 hover:text-ollo-accent-light' : 'text-gray-500 hover:text-ollo-deep'}`;
  const buttonClasses = `w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
  // --- Fim das Definições de Estilo OLLO ---

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden ${pageClasses} selection:bg-ollo-deep/30 selection:text-ollo-deep`}>
      {showConfetti && windowSize.width && windowSize.height && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={600} // <<---- MAIS PARTÍCULAS
          gravity={0.08}     // <<---- GRAVIDADE MENOR (MAIS LENTA A QUEDA)
          wind={0.01}        // <<---- VENTO SUTIL PARA ESPALHAR UM POUCO
          initialVelocityX={{ min: -8, max: 8 }} // Ajusta dispersão horizontal
          initialVelocityY={{ min: -12, max: 8 }}  // Algumas sobem um pouco mais
          confettiSource={{ // Para espalhar mais a origem dos confetes
            x: windowSize.width / 2,
            y: -50, // Começa um pouco acima da tela
            w: windowSize.width, // Usa toda a largura como área de origem
            h: 0
          }}
          tweenDuration={10000} // Tempo de vida individual das partículas (ms)
        />
      )}
      <div className={`w-full max-w-lg p-7 sm:p-10 space-y-6 rounded-xl ${cardClasses}`}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          <span className={titleMainTextClasses}>Criar Conta</span> <span className={titleOLLOTextClasses}>OLLO</span>
        </h2>

        {error && (
          <div className={`p-3.5 rounded-lg text-sm ${errorClasses}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... (campos do formulário como antes) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label htmlFor="firstName" className={labelClasses}>Nome</label>
              <input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className={inputClasses} placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClasses}>Sobrenome</label>
              <input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className={inputClasses} placeholder="Seu sobrenome" />
            </div>
          </div>

          <div>
            <label htmlFor="age" className={labelClasses}>Idade</label>
            <input id="age" name="age" type="number" required value={formData.age} onChange={handleChange} className={inputClasses} placeholder="Sua idade" />
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputClasses} placeholder="voce@exemplo.com" />
          </div>

          <div>
            <label htmlFor="confirmEmail" className={labelClasses}>Confirmar Email</label>
            <input id="confirmEmail" name="confirmEmail" type="email" autoComplete="email" required value={formData.confirmEmail} onChange={handleChange} className={inputClasses} placeholder="Confirme seu email" />
          </div>

          <div>
            <label htmlFor="password" className={labelClasses}>Senha</label>
            <div className={passwordInputWrapperClasses}>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={inputClasses} placeholder="••••••••"/>
              <span className={passwordInputIconClasses} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClasses}>Confirmar Senha</label>
            <div className={passwordInputWrapperClasses}>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={inputClasses} placeholder="••••••••"/>
              <span className={passwordInputIconClasses} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="referralCode" className={labelClasses}>
              Código de Indicação <span className="text-xs font-normal">(Opcional)</span>
            </label>
            <input id="referralCode" name="referralCode" type="text" value={formData.referralCode} onChange={handleChange} className={inputClasses} placeholder="Código recebido"/>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className={buttonClasses}>
              {loading ? 'Concluindo Registro...' : 'Concluir Registro'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center">
          Já tem uma conta?{' '}
          <Link to="/login" className={linkClasses}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;