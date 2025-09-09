// ARQUIVO COMPLETO E CORRIGIDO: src/App.jsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

  // Dados do AuthContext
  const { currentUser, loading, reloadCurrentUser } = useAuth();

  // ProfileStore connection - OTIMIZADO
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);

  // Memoização da função de reload para evitar re-renders desnecessários
  const memoizedReloadUser = useMemo(
    () => reloadCurrentUser,
    [reloadCurrentUser]
  );

  useEffect(() => {
    // Conecta função de reload apenas quando necessário
    if (memoizedReloadUser && typeof memoizedReloadUser === 'function') {
      console.log('[App] Configurando função de reload no ProfileStore');
      setReloadAuthUser(memoizedReloadUser);
    }
  }, [memoizedReloadUser, setReloadAuthUser]);

  // Callbacks memoizados para performance
  const openModal = useCallback(() => {
    console.log('[App] Abrindo modal de criar post');
    setIsCreatePostModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('[App] Fechando modal de criar post');
    setIsCreatePostModalOpen(false);
  }, []);

  // Estado de loading global
  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <SidebarNav onTriggerCreatePost={openModal} />

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* BANNER DE VERIFICAÇÃO - RENDERIZAÇÃO CONDICIONAL OTIMIZADA */}
              {currentUser && !currentUser.emailVerified && (
                <EmailVerificationBanner />
              )}

              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>

          {/* Modal de criar post */}
          {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                maxWidth: '500px',
              },
            }}
          />

          {/* Dev mode selector apenas em desenvolvimento */}
          {import.meta.env.DEV && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
