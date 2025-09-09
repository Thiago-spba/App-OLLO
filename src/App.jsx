// ARQUIVO COMPLETO E CORRIGIDO: src/App.jsx

import React, { useState, useCallback, useEffect } from 'react'; // Adicionado useEffect
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { useProfileStore } from './hooks/useProfileStore'; // Importa o ProfileStore

// Componente GlobalLoader (sem alterações)
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

// Componente EmailVerificationBanner (sem alterações)
const EmailVerificationBanner = ({ onResendVerification }) => (
  <div
    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
    role="alert"
  >
    <div className="flex">
      <div className="py-1">
        <svg
          className="fill-current h-6 w-6 text-yellow-500 mr-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" />
        </svg>
      </div>
      <div>
        <p className="font-bold">Verifique seu e-mail</p>
        <p className="text-sm">
          Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de
          entrada ou
          <button
            onClick={onResendVerification}
            className="font-bold underline ml-1 hover:text-yellow-800"
          >
            clique aqui para reenviar o link
          </button>
          .
        </p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // CORREÇÃO: Buscamos `reloadCurrentUser` aqui para injetar no store
  const { currentUser, loading, resendVerificationEmail, reloadCurrentUser } =
    useAuth();

  // <<< CORREÇÃO PRINCIPAL >>>
  // Conecta a função de recarregar usuário do AuthContext ao ProfileStore
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);
  useEffect(() => {
    // Garante que a função `reloadCurrentUser` seja passada para o store
    // assim que ela estiver disponível, resolvendo o erro de "função não injetada".
    if (reloadCurrentUser) {
      setReloadAuthUser(reloadCurrentUser);
    }
  }, [reloadCurrentUser, setReloadAuthUser]);

  const openModal = useCallback(() => setIsCreatePostModalOpen(true), []);
  const closeModal = useCallback(() => setIsCreatePostModalOpen(false), []);

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
          {/* CORREÇÃO: Usando import.meta.env.DEV, a forma correta para Vite */}
          {import.meta.env.DEV && <DevModeSelector />}
        </div>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
