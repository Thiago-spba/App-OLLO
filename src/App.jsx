// src/App.jsx

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

function App() {
  // A sua lógica de estado permanece a mesma.
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

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

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  const mainLayoutProps = { openCreatePostModal, toggleTheme };

  const themeClasses = darkMode
    ? 'bg-ollo-deep text-ollo-light'
    : 'bg-ollo-light text-ollo-deep';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
      <Routes>
        {/* Rotas que NÃO usam o MainLayout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* --- Rotas Públicas com Layout --- */}
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

        {/* --- Rota do Perfil (PÚBLICA PARA TESTE) --- */}
        <Route
          path="/profile"
          element={
            <MainLayout {...mainLayoutProps}>
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={() => {}}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />
            </MainLayout>
          }
        />
        <Route
          path="/profile/:profileId"
          element={
            <MainLayout {...mainLayoutProps}>
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={() => {}}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />
            </MainLayout>
          }
        />

        {/* --- Rotas Protegidas --- */}
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
      <Footer />
      {isCreatePostModalOpen && (
        <CreatePostModal onClose={closeCreatePostModal} onAddPost={() => {}} />
      )}
    </div>
  );
}

export default App;
