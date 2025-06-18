// src/layouts/MainLayout.jsx - Refatorado para usar Outlet

import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Importar o Outlet
import SidebarNav from '../components/SidebarNav';

// MainLayout agora recebe as props para a Sidebar, mas não mais "children".
function MainLayout({ openCreatePostModal, darkMode, toggleTheme }) {
  return (
    <div className="flex h-screen">
      <SidebarNav
        openCreatePostModal={openCreatePostModal}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto 
                     p-4 sm:p-6 md:p-8 
                     transition-colors duration-300 ease-in-out
                     ${
                       darkMode
                         ? 'bg-gradient-to-br from-ollo-deep to-gray-900' // Gradiente elegante para modo escuro
                         : 'bg-gradient-to-b from-ollo-crystal-green to-ollo-sky-blue' // Gradiente vibrante para modo claro
                     }`}
        >
          {/* 
            2. Substituímos {children} por <Outlet />.
            O react-router agora irá renderizar a rota filha correspondente (HomePage, ProfilePage, etc.) aqui.
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
