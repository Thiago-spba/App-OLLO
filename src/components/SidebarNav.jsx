import { NavLink, useNavigate, Link } from 'react-router-dom'; // Adicionado Link
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BuildingStorefrontIcon,
  // Você pode adicionar outros ícones se quiser!
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function SidebarNav({ openCreatePostModal, darkMode, toggleTheme }) {
  // <<--- Adicionadas as props
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getSidebarNavLinkClass = ({ isActive }) => {
    const baseClasses =
      'flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start';
    if (isActive) {
      return `${baseClasses} bg-ollo-accent text-white shadow-sm dark:bg-ollo-accent-light dark:text-ollo-deep`;
    }
    return `${baseClasses} text-gray-600 hover:bg-gray-200/70 hover:text-ollo-deep dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white`;
  };

  const createPostButtonClass =
    'w-full flex items-center justify-center mt-4 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-ollo-accent text-white hover:bg-opacity-90 dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90 focus:ring-ollo-accent dark:focus:ring-ollo-accent-light focus:ring-offset-ollo-light dark:focus:ring-offset-ollo-deep';
  const logoutButtonClass =
    'w-full flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start text-gray-600 hover:bg-red-100 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-500/20 dark:hover:text-red-400';

  return (
    <div className="h-screen bg-ollo-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-200/80 dark:border-gray-700/50 shadow-sm transition-all duration-300 ease-in-out dark:bg-ollo-deep">
      <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex items-center justify-center">
        {/* Usando Link em vez de NavLink para o logo, para não ter estilo de 'ativo' */}
        <Link
          to="/"
          className="focus:outline-none focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-light dark:focus:ring-offset-ollo-deep rounded-md"
          title="Página Inicial OLLO"
        >
          <img
            src="/images/logo_ollo.jpeg"
            alt="Logo OLLO"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-grow space-y-2">
        <NavLink to="/" title="Início" className={getSidebarNavLinkClass} end>
          <HomeIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Início</span>
        </NavLink>
        <NavLink
          to="/explore"
          title="Explorar"
          className={getSidebarNavLinkClass}
        >
          <MagnifyingGlassIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Explorar</span>
        </NavLink>
        <NavLink
          to="/marketplace"
          title="Mercado"
          className={getSidebarNavLinkClass}
        >
          <BuildingStorefrontIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Mercado</span>
        </NavLink>

        {currentUser && (
          <>
            <NavLink
              to="/notifications"
              title="Notificações"
              className={getSidebarNavLinkClass}
            >
              <BellIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
              <span className="hidden lg:inline">Notificações</span>
            </NavLink>
            <NavLink
              to="/profile"
              title="Meu Perfil"
              className={getSidebarNavLinkClass}
            >
              <UserCircleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
              <span className="hidden lg:inline">Meu Perfil</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto flex-shrink-0 pb-2 space-y-2">
        {currentUser ? (
          <>
            <button
              title="Criar Post"
              onClick={openCreatePostModal}
              className={createPostButtonClass}
            >
              <PencilSquareIcon className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:inline">Criar Post</span>
            </button>
            <button
              title="Sair"
              onClick={handleLogout}
              className={logoutButtonClass}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
              <span className="hidden lg:inline">Sair</span>
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            title="Entrar"
            className={getSidebarNavLinkClass}
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
            <span className="hidden lg:inline">Entrar</span>
          </NavLink>
        )}

        {/* === Botão de alternância de tema === */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-center mt-2 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-ollo-accent dark:focus:ring-ollo-accent-light focus:ring-offset-2"
          title="Alternar tema"
        >
          {darkMode ? (
            <>
              <span className="mr-2">🌙</span>
              <span className="hidden lg:inline">Modo Escuro</span>
            </>
          ) : (
            <>
              <span className="mr-2">☀️</span>
              <span className="hidden lg:inline">Modo Claro</span>
            </>
          )}
        </button>
        {/* === FIM DO BOTÃO DE TEMA === */}
      </div>
    </div>
  );
}

export default SidebarNav;
