// ARQUIVO COMPLETO: src/App.jsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { Toaster, toast } from 'react-hot-toast';
import { getAuth, applyActionCode } from 'firebase/auth'; // <--- OBRIGATÓRIO: Funções do Firebase

// --- COMPONENTES VISUAIS ---
import SidebarNav from './components/SidebarNav';
import CreatePostModal from './components/CreatePostModal';
import DevModeSelector from './components/DevModeSelector';
import AppErrorBoundary from './components/AppErrorBoundary';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';

// --- CONTEXTOS ---
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// --- STORE ---
import { useProfileStore } from './stores/useProfileStore';

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

  // 1. Dados do AuthContext
  const { currentUser, loading, reloadCurrentUser, userProfile } = useAuth();
  const navigate = useNavigate(); // Hook de navegação

  // 2. Conexão com o ProfileStore
  const setReloadAuthUser = useProfileStore((state) => state.setReloadAuthUser);
  const setCurrentUserStore = useProfileStore((state) => state.setCurrentUser);
  const initializeStore = useProfileStore((state) => state.initialize);

  // Ref para garantir que a verificação rode apenas uma vez por load
  const verificationProcessed = useRef(false);

  // --- 🔴 INTERCEPTADOR DE LINK DE E-MAIL (NOVO CÓDIGO) ---
  useEffect(() => {
    // Verifica se existe o código 'oobCode' na URL atual
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode');
    const mode = params.get('mode'); // O Firebase envia mode=verifyEmail

    // Se houver código e ainda não processamos
    if (oobCode && !verificationProcessed.current) {
      verificationProcessed.current = true; // Trava para não rodar 2x

      const handleGlobalVerify = async () => {
        const toastId = toast.loading('Processando verificação de e-mail...');

        try {
          const auth = getAuth();
          // 1. Aplica o código no Firebase (Isso valida a conta)
          await applyActionCode(auth, oobCode);

          // 2. Força a atualização do usuário local para saber que virou "verified: true"
          if (reloadCurrentUser) {
            await reloadCurrentUser();
          }

          toast.success('E-mail verificado com sucesso!', { id: toastId });

          // 3. Limpa a URL e manda para a Home limpa
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Erro na verificação automática:', error);

          let msg = 'Erro ao verificar link.';
          if (error.code === 'auth/invalid-action-code') {
            msg = 'Este link já foi usado ou expirou.';
          }
          // Se der erro, avisa e deixa o usuário na tela atual (provavelmente verify-email)
          toast.error(msg, { id: toastId });
        }
      };

      handleGlobalVerify();
    }
  }, [navigate, reloadCurrentUser]);
  // -----------------------------------------------------------

  // --- A "PONTE" DE SINCRONIZAÇÃO (Mantida do seu código) ---

  // A. Sincroniza a função de reload
  useEffect(() => {
    if (reloadCurrentUser) {
      setReloadAuthUser(reloadCurrentUser);
    }
  }, [reloadCurrentUser, setReloadAuthUser]);

  // B. Sincroniza o usuário atual com o Store
  useEffect(() => {
    setCurrentUserStore(currentUser);
  }, [currentUser, setCurrentUserStore]);

  // C. Inicializa os dados do perfil no Store
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
          {/* Sidebar */}
          <SidebarNav onTriggerCreatePost={openModal} />

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* Banner de Verificação */}
              {currentUser && !currentUser.emailVerified && (
                <EmailVerificationBanner />
              )}

              {/* Outlet das páginas */}
              <Outlet context={{ openCreatePostModal: openModal }} />
            </div>
          </main>

          {/* Modais e Utilitários */}
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
