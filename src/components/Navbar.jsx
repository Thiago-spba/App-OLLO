// src/layouts/MainLayout.jsx
import React from 'react';
import SidebarNav from '../components/SidebarNav';
import Navbar from '../components/Navbar';

function MainLayout({ children, openCreatePostModal, darkMode, toggleTheme }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar Mobile (exibe apenas em telas pequenas) */}
      <div className="md:hidden sticky top-0 z-50">
        <Navbar openCreatePostModal={openCreatePostModal} />
      </div>

      {/* Layout principal com Sidebar e Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop (exibe a partir de md) */}
        <aside className="hidden md:flex md:w-64 lg:w-72 xl:w-80 bg-white dark:bg-ollo-slate border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <SidebarNav
            openCreatePostModal={openCreatePostModal}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        </aside>

        {/* Conteúdo principal */}
        <main
          className={`
            flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6
            bg-gradient-to-b 
            from-ollo-light via-ollo-crystal-green to-ollo-sky-blue
            dark:from-gray-900 dark:via-ollo-deep dark:to-gray-800
            text-ollo-deep dark:text-ollo-light
            transition-all duration-300 ease-in-out
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
