import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

function SidebarNav({ openCreatePostModal }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

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

  // Switch Tema
  const themeToggleBtnClass = clsx(
    'w-14 h-14 flex items-center justify-center mx-auto mb-3 rounded-2xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-ollo-accent dark:focus:ring-ollo-accent-light',
    darkMode
      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 hover:from-gray-700 hover:to-gray-800'
      : 'bg-gradient-to-br from-ollo-crystal-green via-white to-ollo-sky-blue hover:from-ollo-light hover:to-ollo-crystal-green'
  );

// ...importações e funções acima mantidas

return (
  <div className="h-screen bg-ollo-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-200/80 dark:border-gray-700/50 shadow-sm transition-all duration-300 ease-in-out dark:bg-ollo-deep">
    <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex flex-col items-center justify-center">
      {/* Logo OLLO */}
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
      {/* ...NavLinks aqui, sem alteração */}
      {/* igual antes */}
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

    {/* INFERIOR: Switch de Tema acima do Entrar/Sair */}
    <div className="mt-auto flex-shrink-0 pb-2 flex flex-col items-center space-y-2">

      {/* Switch Tema */}
      <button
        onClick={toggleTheme}
        aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        className={themeToggleBtnClass}
        tabIndex={0}
      >
        {darkMode ? (
          <SunIcon className="h-9 w-9 text-ollo-accent transition-all duration-300" />
        ) : (
          <MoonIcon className="h-9 w-9 text-gray-700 transition-all duration-300" />
        )}
      </button>

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
    </div>
  </div>
);
}
export default SidebarNav;
