// src/App.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './components/SidebarNav.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const openModal = () => setIsCreatePostModalOpen(true);
  const closeModal = () => setIsCreatePostModalOpen(false);

  return (
    <div className="flex min-h-screen bg-ollo-light dark:bg-ollo-deep transition-colors duration-300">
      <SidebarNav onTriggerCreatePost={openModal} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Passa funções para o Outlet */}
          <Outlet context={{ openCreatePostModal: openModal }} />
        </div>
      </main>
      {/* Modal global de criação de post */}
      {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}
      <Toaster position="top-center" />
    </div>
  );
}
