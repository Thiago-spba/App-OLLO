// ARQUIVO COMPLETO: src/App.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- COMPONENTES VISUAIS (Mantidos originais) ---
import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';

// --- CONTEXTOS ---
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// --- STORE (Caminho corrigido para o novo arquivo que criamos) ---
import { useProfileStore } from './stores/useProfileStore';

// Componente GlobalLoader (Mantido)
const GlobalLoader = React.memo(() => (
  <div
    className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900"
    role="status"
    aria-label="Carregando aplicação"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="sr-only">Carregando OLLO...</span>
  </div>
));
GlobalLoader.displayName = 'GlobalLoader';

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // 1. Dados do AuthContext (Adicionamos userProfile aqui)
  const { currentUser, loading, reloadCurrentUser, userProfile } = useAuth();

  // 2. Conexão com o ProfileStore (Adicionamos setters e initialize)
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);
  const setCurrentUserStore = useProfileStore((state) => state.setCurrentUser);
  const initializeStore = useProfileStore((state) => state.initialize);

  // --- A "PONTE" DE SINCRONIZAÇÃO (Lógica Nova) ---

  // A. Sincroniza a função de reload (Sem memoização excessiva, o Zustand lida bem)
  useEffect(() => {
    if (reloadCurrentUser) {
      setReloadAuthUser(reloadCurrentUser);
    }
  }, [reloadCurrentUser, setReloadAuthUser]);

  // B. Sincroniza o usuário atual com o Store
  useEffect(() => {
    setCurrentUserStore(currentUser);
  }, [currentUser, setCurrentUserStore]);

  // C. Inicializa os dados do perfil no Store assim que o Auth baixá-los
  useEffect(() => {
    if (userProfile) {
      initializeStore(userProfile);
    }
  }, [userProfile, initializeStore]);

  // --- INTERFACE (UI) ---

  const openModal = useCallback(() => {
    setIsCreatePostModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsCreatePostModalOpen(false);
  }, []);

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Sidebar (Mantido intacto) */}
          <SidebarNav onTriggerCreatePost={openModal} />

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* Banner de Verificação (Mantido) */}
              {currentUser && !currentUser.emailVerified && (
                <EmailVerificationBanner />
              )}

              {/* Outlet das páginas */}
              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>

          {/* Modais e Utilitários (Mantidos) */}
          {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { maxWidth: '500px' },
            }}
          />

          {import.meta.env.DEV && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
