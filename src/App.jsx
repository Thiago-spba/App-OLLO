// src/App.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Importe componentes de layout e globais
import Sidebar from './components/SideBarNav.jsx'; // Verifique se o nome do arquivo está correto
import CreatePostModal from './components/CreatePostModal.jsx';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const openModal = () => setIsCreatePostModalOpen(true);
  const closeModal = () => setIsCreatePostModalOpen(false);

  return (
    <div className="flex min-h-screen bg-ollo-light dark:bg-ollo-deep transition-colors duration-300">
      {/* O Sidebar agora recebe a função para abrir o modal como prop */}
      <Sidebar onTriggerCreatePost={openModal} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* A HomePage também receberá a função de abrir o modal via Outlet context */}
          <Outlet context={{ openCreatePostModal: openModal }} />
        </div>
      </main>

      {/* Renderização condicional do modal */}
      {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}

      <Toaster position="top-center" />
    </div>
  );
}
