// src/components/Footer.jsx
import { Link } from 'react-router-dom';

// Footer agora aceita a prop darkMode
function Footer({ darkMode }) {
  const currentYear = new Date().getFullYear(); // Calcula o ano atual

  return (
    <footer 
      className={`w-full p-6 md:py-8 mt-auto
                  ${darkMode 
                    ? 'bg-gray-950 text-gray-400 border-t border-gray-700/50' // Estilo Modo Escuro
                    : 'bg-gray-100 text-gray-600 border-t border-gray-200'   // Estilo Modo Claro
                  }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 
              className={`text-xl font-bold mb-1 ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep'}`}
            >
              OLLO
            </h3>
            <p className="text-xs"> 
              &copy; {currentYear} OLLO. Todos os direitos reservados.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 md:space-x-6">
            <Link 
              to="/terms" // Certifique-se de que esta rota existe no seu App.jsx
              className={`text-xs sm:text-sm hover:underline ${darkMode ? 'hover:text-ollo-bg-light' : 'hover:text-ollo-deep'}`}
            >
              Termos de Serviço
            </Link>
            <Link 
              to="/privacy" // Certifique-se de que esta rota existe
              className={`text-xs sm:text-sm hover:underline ${darkMode ? 'hover:text-ollo-bg-light' : 'hover:text-ollo-deep'}`}
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/help" // Certifique-se de que esta rota existe
              className={`text-xs sm:text-sm hover:underline ${darkMode ? 'hover:text-ollo-bg-light' : 'hover:text-ollo-deep'}`}
            >
              Ajuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
