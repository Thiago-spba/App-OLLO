// src/App.jsx
// com uma lógica de verificação de e-mail simplificada e resiliente.

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';

import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Seu excelente componente de Loader (mantido)
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

// Seu excelente componente de Banner (mantido)
const EmailVerificationBanner = ({ onResendVerification }) => (
  <div
    className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4"
    role="alert"
  >
    <div className="flex">
      <div className="py-1">
        <svg
          className="h-6 w-6 text-yellow-500 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <p className="font-bold">Verificação de e-mail pendente</p>
        <p className="text-sm">
          Por favor, verifique sua caixa de entrada para confirmar seu e-mail.
        </p>
        <button
          onClick={onResendVerification}
          className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-xs"
        >
          Reenviar e-mail de verificação
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const { currentUser, loading, reloadCurrentUser, resendVerificationEmail } =
    useAuth();

  const openModal = useCallback(() => setIsCreatePostModalOpen(true), []);
  const closeModal = useCallback(() => setIsCreatePostModalOpen(false), []);

  // <<< LÓGICA REFINADA E SIMPLIFICADA >>>
  useEffect(() => {
    // A lógica é direta: se temos um usuário logado e ele não está verificado,
    // tentamos recarregar seus dados do servidor.
    // Removemos a flag 'hasCheckedVerification' porque este efeito é auto-corretivo.
    // Se o reload funcionar, na próxima renderização 'currentUser.emailVerified' será true
    // e esta condição não será mais atendida. É mais simples e robusto.
    if (currentUser && !currentUser.emailVerified) {
      console.log(
        'Usuário não verificado. Recarregando dados para sincronizar...'
      );
      reloadCurrentUser();
    }
  }, [currentUser, reloadCurrentUser]);

  // Handler robusto para reenviar verificação de email (mantido)
  const handleResendVerification = useCallback(async () => {
    await resendVerificationEmail();
    // A mensagem de sucesso/erro já é tratada dentro do hook `useAuth`,
    // o que deixa este handler mais limpo.
  }, [resendVerificationEmail]);

  // Exibir loader durante o carregamento inicial (mantido)
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
              {/* Lógica para mostrar o banner de verificação (mantido) */}
              {currentUser && !currentUser.emailVerified && (
                <EmailVerificationBanner
                  onResendVerification={handleResendVerification}
                />
              )}
              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>

          {isCreatePostModalOpen && <CreatePostModal onClose={closeModal} />}

          <Toaster
            position="top-center"
            // Suas ótimas customizações do Toaster (mantidas)
          />

          {process.env.NODE_ENV === 'development' && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
