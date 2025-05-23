// src/layouts/MainLayout.jsx
import React from 'react';
import SidebarNav from '../components/SidebarNav'; // Verifique se este caminho está correto

// MainLayout agora recebe darkMode e toggleTheme
function MainLayout({ children, openCreatePostModal, darkMode, toggleTheme }) {
  return (
    // O div principal do MainLayout ocupa toda a altura da tela e organiza a sidebar e o conteúdo.
    // Não define um fundo próprio aqui, permitindo que o fundo do App.jsx (que já é dinâmico) seja a base.
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
                     ${darkMode 
                       ? 'bg-gradient-to-br from-ollo-deep to-gray-900' // Gradiente para modo escuro
                       : 'bg-gradient-to-b from-ollo-crystal-green to-ollo-sky-blue' // Seu gradiente para modo claro
                     }`}
        >
          {children} {/* Aqui suas páginas serão renderizadas */}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;