import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Context de autenticação
import { useAuth } from './context/AuthContext';

// Layouts e Rotas
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/auth/PrivateRoute';

// Componentes
import Footer from './components/Footer';
import CreatePostModal from './components/CreatePostModal';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Páginas
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import PostDetailPage from './pages/PostDetailPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ActionHandlerPage from './pages/ActionHandlerPage';
import ExplorePage from './pages/ExplorePage';

function App() {
  // Estado local do App
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );
  const [sessionFollowStatus, setSessionFollowStatus] = useState({});
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Estado de autenticação do contexto
  const { currentUser, loading } = useAuth();

  // Tema (dark/light)
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Funções utilitárias
  const toggleTheme = () => setDarkMode(!darkMode);
  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  const handlePostSuccess = () => {
    toast.success('🎉 Post publicado com sucesso no OLLO!');
    closeCreatePostModal();
  };

  const themeClasses = darkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
      {/* Toaster para feedback visual */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#f3f4f6' : '#111827',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '1rem',
            fontSize: '1rem',
          },
        }}
      />

      {/* Overlay de loading unificado */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950">
          <LoadingSpinner />
        </div>
      )}

      {/* Rotas da aplicação */}
      <Routes>
        {/* Rotas públicas SEM layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/actions" element={<ActionHandlerPage />} />

        {/* Rotas públicas COM layout principal */}
        <Route
          element={
            <MainLayout
              openCreatePostModal={openCreatePostModal}
              toggleTheme={toggleTheme}
              darkMode={darkMode}
            />
          }
        >
          {/* Apenas a Home é realmente pública para navegação */}
          <Route
            path="/"
            element={
              <HomePage
                onTriggerCreatePost={openCreatePostModal}
                onCommentSubmit={() => {}}
                onDeletePost={() => {}}
              />
            }
          />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
        </Route>

        {/* ROTAS PRIVADAS: somente para usuários autenticados */}
        <Route element={<PrivateRoute />}>
          <Route
            element={
              <MainLayout
                openCreatePostModal={openCreatePostModal}
                toggleTheme={toggleTheme}
                darkMode={darkMode}
              />
            }
          >
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route
              path="/marketplace/detalhes/:listingId"
              element={<ListingDetailPage />}
            />
            <Route path="/marketplace/criar" element={<CreateListingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/profile/:profileId?"
              element={
                <ProfilePage
                  key="profile-page-private"
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              }
            />
          </Route>
        </Route>
      </Routes>

      {/* Footer visível em toda a aplicação */}
      <Footer darkMode={darkMode} />

      {/* Modal de criação de post */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          onClose={closeCreatePostModal}
          onAddPost={handlePostSuccess}
          darkMode={darkMode}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default App;
