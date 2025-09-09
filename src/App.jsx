// ARQUIVO COMPLETO E CORRIGIDO: src/App.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useProfileStore } from './hooks/useProfileStore';

// Componente GlobalLoader
const GlobalLoader = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-ollo-light dark:bg-ollo-deep"
    role="status"
    aria-label="Carregando aplicação"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ollo-blue"></div>
    <span className="sr-only">Carregando OLLO...</span>
  </div>
);

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Buscamos dados do AuthContext
  const { currentUser, loading, reloadCurrentUser } = useAuth();

  // Conecta a função de recarregar usuário do AuthContext ao ProfileStore
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);
  useEffect(() => {
    // Garante que a função `reloadCurrentUser` seja passada para o store
    if (reloadCurrentUser) {
      setReloadAuthUser(reloadCurrentUser);
    }
  }, [reloadCurrentUser, setReloadAuthUser]);

  const openModal = useCallback(() => setIsCreatePostModalOpen(true), []);
  const closeModal = useCallback(() => setIsCreatePostModalOpen(false), []);

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <div className="flex min-h-screen bg-ollo-light dark:bg-ollo-deep transition-colors duration-300">
          <SidebarNav onTriggerCreatePost={openModal} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              <EmailVerificationBanner />
              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>
          {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}
          <Toaster position="top-center" />
          {import.meta.env.DEV && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
