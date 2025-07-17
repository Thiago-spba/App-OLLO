// src/App.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './components/SidebarNav.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';
import { Toaster } from 'react-hot-toast';

// 1. IMPORTAR o ThemeProvider que criamos
import { ThemeProvider } from './context/ThemeContext.jsx';

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const openModal = () => setIsCreatePostModalOpen(true);
  const closeModal = () => setIsCreatePostModalOpen(false);

  return (
    // 2. ENVOLVER todo o layout com o ThemeProvider
    // Isso "ativará" o useTheme() que seu SidebarNav já está usando.
    <ThemeProvider>
      <div className="flex min-h-screen bg-ollo-light dark:bg-ollo-deep transition-colors duration-300">
        <SidebarNav onTriggerCreatePost={openModal} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet context={{ openCreatePostModal: openModal }} />
          </div>
        </main>
        {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
}
