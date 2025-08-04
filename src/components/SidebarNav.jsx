// src/components/SidebarNav.jsx
// OLLO - Menu lateral principal, seguro, responsivo, pronto para expansão e exportação default garantida

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

// Ícones principais
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BuildingStorefrontIcon,
  KeyIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

// Hook de admin
import { useIsAdmin } from '@/hooks/useIsAdmin';

/**
 * Item de navegação reutilizável do menu lateral.
 */
const NavItem = ({ to, title, icon: Icon, end = false }) => {
  const getNavLinkClass = ({ isActive }) =>
    clsx(
      'flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start',
      {
        'bg-ollo-accent text-white shadow-sm dark:bg-ollo-accent-light dark:text-ollo-deep':
          isActive,
        'text-gray-600 hover:bg-gray-200/70 hover:text-ollo-deep dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white':
          !isActive,
      }
    );

  return (
    <NavLink to={to} title={title} className={getNavLinkClass} end={end}>
      <Icon className="h-6 w-6 flex-shrink-0 lg:mr-3" aria-hidden="true" />
      <span className="hidden lg:inline">{title}</span>
    </NavLink>
  );
};

/**
 * Componente principal do menu lateral OLLO.
 */
function SidebarNav({ onTriggerCreatePost }) {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      console.error('[OLLO] Erro ao fazer logout:', error);
    }
  };

  const themeToggleBtnClass = clsx(
    'w-14 h-14 flex items-center justify-center mx-auto mb-3 rounded-2xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-ollo-accent dark:focus:ring-ollo-accent-light',
    darkMode
      ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 hover:from-gray-700 hover:to-gray-800'
      : 'bg-gradient-to-br from-ollo-crystal-green via-white to-ollo-sky-blue hover:from-ollo-light hover:to-ollo-crystal-green'
  );

  const createPostButtonClass =
    'w-full flex items-center justify-center mt-4 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-ollo-accent text-white hover:bg-opacity-90 dark:bg-ollo-accent-light dark:text-ollo-deep dark:hover:bg-opacity-90 focus:ring-ollo-accent dark:focus:ring-ollo-accent-light focus:ring-offset-ollo-light dark:focus:ring-offset-ollo-deep';

  const logoutButtonClass =
    'w-full flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start text-gray-600 hover:bg-red-100 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-500/20 dark:hover:text-red-400';

  return (
    <aside
      aria-label="Barra de navegação principal"
      className="h-screen bg-ollo-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-200/80 dark:border-gray-700/50 shadow-sm transition-all duration-300 ease-in-out dark:bg-ollo-deep"
    >
      {/* Logo OLLO */}
      <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex flex-col items-center justify-center">
        <Link
          to="/"
          className="focus:outline-none focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-light dark:focus:ring-offset-ollo-deep rounded-md"
          title="Página Inicial OLLO"
        >
          <img
            src="/images/logo_ollo.jpeg"
            alt="Logo OLLO"
            className="h-16 w-auto rounded-lg"
          />
        </Link>
      </div>

      {/* Navegação principal */}
      <nav className="flex-grow space-y-2" aria-label="Navegação principal">
        <NavItem to="/" title="Início" icon={HomeIcon} end />
        <NavItem to="/explore" title="Explorar" icon={MagnifyingGlassIcon} />
        <NavItem
          to="/marketplace"
          title="Mercado"
          icon={BuildingStorefrontIcon}
        />
        {currentUser && (
          <>
            <NavItem to="/notifications" title="Notificações" icon={BellIcon} />
            <NavItem to="/profile" title="Meu Perfil" icon={UserCircleIcon} />
          </>
        )}
      </nav>

      {/* Área inferior: temas, criar post, admin, sair/entrar */}
      <div className="mt-auto flex-shrink-0 pb-2 flex flex-col items-center space-y-2">
        {/* Botão de alternar tema */}
        <button
          onClick={toggleTheme}
          aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className={themeToggleBtnClass}
          type="button"
        >
          {darkMode ? (
            <SunIcon className="h-9 w-9 text-ollo-accent" />
          ) : (
            <MoonIcon className="h-9 w-9 text-gray-700" />
          )}
        </button>

        {/* Se logado, mostra criar post, admin e sair */}
        {currentUser ? (
          <>
            {/* Criar Post */}
            <button
              title="Criar Post"
              onClick={onTriggerCreatePost}
              className={createPostButtonClass}
              type="button"
            >
              <PencilSquareIcon
                className="h-5 w-5 lg:mr-2"
                aria-hidden="true"
              />
              <span className="hidden lg:inline">Criar Post</span>
            </button>

            {/* Botão Admin, se admin */}
            <AdminButton />

            {/* Sair */}
            <button
              title="Sair"
              onClick={handleLogout}
              className={logoutButtonClass}
              type="button"
            >
              <ArrowLeftOnRectangleIcon
                className="h-6 w-6 flex-shrink-0 lg:mr-3"
                aria-hidden="true"
              />
              <span className="hidden lg:inline">Sair</span>
            </button>
          </>
        ) : (
          <NavItem
            to="/login"
            title="Entrar"
            icon={ArrowRightOnRectangleIcon}
          />
        )}
      </div>
    </aside>
  );
}

/**
 * Botão visível apenas para administradores.
 */
function AdminButton() {
  const { isAdmin, loading } = useIsAdmin();
  if (loading || !isAdmin) return null;
  return (
    <Link
      to="/admin"
      title="Painel Administrativo"
      className="w-full flex items-center px-3 lg:px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-150 ease-in-out justify-center lg:justify-start text-ollo-accent hover:bg-gray-200/70 dark:text-ollo-accent-light dark:hover:bg-gray-700/50"
    >
      <span className="hidden lg:flex items-center gap-2">
        <KeyIcon className="h-5 w-5" aria-hidden="true" />
        Administração
      </span>
      <span className="lg:hidden">
        <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
      </span>
    </Link>
  );
}

// Exportação default garantida
export default SidebarNav;
