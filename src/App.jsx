import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import CreatePostModal from './components/CreatePostModal';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
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
import ProtectedRoute from './components/auth/ProtectedRoute';
import ActionHandlerPage from './pages/ActionHandlerPage';
import { Toaster } from 'react-hot-toast';

function App() {
  // Estado do tema dark/light
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Estados da aplicação
  const [sessionFollowStatus, setSessionFollowStatus] = useState({});
  const [posts, setPosts] = useState([
    {
      id: 1,
      postId: 'bem-vindo-ollo',
      userName: 'Usuário OLLO',
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
      content:
        'Bem-vindo ao OLLO! Uma nova plataforma para conectar e compartilhar. Explore, crie e divirta-se!',
    },
  ]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Efeito para persistir o tema
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    const root = window.document.documentElement;
    root.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Funções utilitárias
  const toggleTheme = () => setDarkMode(!darkMode);
  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  // Props compartilhadas
  const mainLayoutProps = {
    openCreatePostModal,
    toggleTheme,
    darkMode, // Adicionado para acesso em componentes filhos
  };

  // Classes condicionais de tema
  const themeClasses = darkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
      {/* Componente Toaster para notificações globais */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#1f2937' : '#ffffff',
            color: darkMode ? '#f3f4f6' : '#111827',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      />

      <Routes>
        {/* Rotas que NÃO usam o MainLayout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/actions" element={<ActionHandlerPage />} />

        {/* Rotas Públicas com MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout {...mainLayoutProps}>
              <HomePage
                posts={posts}
                onTriggerCreatePost={openCreatePostModal}
                onCommentSubmit={() => {}}
                onDeletePost={() => {}}
              />
            </MainLayout>
          }
        />
        <Route
          path="/explore"
          element={
            <MainLayout {...mainLayoutProps}>
              <ExplorePage allPosts={posts} onCommentSubmit={() => {}} />
            </MainLayout>
          }
        />
        <Route
          path="/marketplace"
          element={
            <MainLayout {...mainLayoutProps}>
              <MarketplacePage />
            </MainLayout>
          }
        />
        <Route
          path="/marketplace/detalhes/:listingId"
          element={
            <MainLayout {...mainLayoutProps}>
              <ListingDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <MainLayout {...mainLayoutProps}>
              <PostDetailPage allPosts={posts} />
            </MainLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <MainLayout {...mainLayoutProps}>
              <TermsPage />
            </MainLayout>
          }
        />

        {/* Rotas de Perfil (Protegidas) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <ProfilePage
                  allPosts={posts}
                  onCommentSubmit={() => {}}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:profileId"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <ProfilePage
                  allPosts={posts}
                  onCommentSubmit={() => {}}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Outras Rotas Protegidas */}
        <Route
          path="/marketplace/criar"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <CreateListingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <NotificationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer global */}
      <Footer darkMode={darkMode} />

      {/* Modal de criação de post */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          onClose={closeCreatePostModal}
          onAddPost={(newPost) => {
            setPosts([newPost, ...posts]);
            closeCreatePostModal();
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;
