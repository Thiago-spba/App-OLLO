// src/App.jsx - VERSÃO LIMPA E DEFINITIVA

import React, { useState, useCallback } from 'react'; // <<<<<<< useEffect removido dos imports, pois não é mais usado para a verificação
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Seu componente GlobalLoader (sem alterações)
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

// Seu componente EmailVerificationBanner (sem alterações)
const EmailVerificationBanner = ({ onResendVerification }) => (
  <div
    className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4"
    role="alert"
  >
    <div className="flex">{/* ... todo o seu JSX do banner ... */}</div>
  </div>
);

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  // O hook de auth agora só precisa de resendVerificationEmail para o banner
  const { currentUser, loading, resendVerificationEmail } = useAuth();

  const openModal = useCallback(() => setIsCreatePostModalOpen(true), []);
  const closeModal = useCallback(() => setIsCreatePostModalOpen(false), []);

  // <<< REMOÇÃO DEFINITIVA >>>
  // O useEffect que chamava `reloadCurrentUser` no `visibilitychange` FOI REMOVIDO.
  // Toda a responsabilidade pela verificação de e-mail agora está
  // isolada e controlada pela `VerifyEmailPage.jsx`.

  const handleResendVerification = useCallback(async () => {
    await resendVerificationEmail();
  }, [resendVerificationEmail]);

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
              {currentUser && !currentUser.emailVerified && (
                <EmailVerificationBanner
                  onResendVerification={handleResendVerification}
                />
              )}
              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>
          {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}
          <Toaster position="top-center" />
          {process.env.NODE_ENV === 'development' && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
