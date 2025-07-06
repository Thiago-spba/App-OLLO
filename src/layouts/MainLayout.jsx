// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';
import { motion } from 'framer-motion';

/**
 * @fileoverview MainLayout - Padrão OLLO.
 *
 * @description
 * Este é o componente de layout principal e persistente da aplicação.
 * Na nova arquitetura de rotas, ele atua como um "Route Layout".
 * Sua responsabilidade é renderizar a estrutura visual (Sidebar) e um
 * placeholder <Outlet /> onde o React Router injetará a página filha.
 * Ele não recebe mais props diretamente; os componentes filhos (SidebarNav)
 * agora obtêm o que precisam de seus próprios contextos (ThemeContext, etc.).
 */
function MainLayout() {
  return (
    <div
      className="flex min-h-screen bg-white dark:bg-gray-900"
      aria-label="Layout principal do aplicativo OLLO"
    >
      {/* Navegação lateral */}
      <aside aria-label="Barra lateral de navegação">
        {/* O SidebarNav agora buscará seus próprios dados de contextos */}
        <SidebarNav />
      </aside>

      {/* Conteúdo principal com animação de transição */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.main
          key="main-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors duration-300 ease-in-out bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-ollo-deep dark:to-gray-900"
          aria-label="Conteúdo da página"
        >
          {/* O React Router renderizará a página da rota atual aqui */}
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

export default MainLayout;
