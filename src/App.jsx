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
// MUDANÇA 1: Importa o componente de proteção
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  const [sessionFollowStatus, setSessionFollowStatus] = useState({});
  const [posts, setPosts] = useState([
    {
      id: 1,
      postId: 'bem-vindo-ollo',
      userName: 'Gemini Auxiliar',
      timestamp: 'Agora mesmo',
      content:
        'Bem-vindo ao OLLO! Uma nova plataforma para conectar e compartilhar. Explore, crie e divirta-se!',
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
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

  const handleAddPost = () => {};
  const handleAddComment = () => {};
  const handleDeletePost = () => {};

  const mainLayoutProps = {
    openCreatePostModal,
    toggleTheme,
  };

  const themeClasses = darkMode
    ? 'bg-ollo-deep text-ollo-light'
    : 'bg-ollo-light text-ollo-deep';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
      <Routes>
        {/* --- Rotas Públicas --- */}
        <Route
          path="/"
          element={
            <MainLayout {...mainLayoutProps}>
              <HomePage
                posts={posts}
                onTriggerCreatePost={openCreatePostModal}
                onCommentSubmit={handleAddComment}
                onDeletePost={handleDeletePost}
              />
            </MainLayout>
          }
        />
        <Route
          path="/explore"
          element={
            <MainLayout {...mainLayoutProps}>
              <ExplorePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
              />
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

        {/* --- Rotas de Autenticação (públicas) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* --- MUDANÇA 2: Rotas Protegidas --- */}
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
          path="/profile/:profileId"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <ProfilePage
                  allPosts={posts}
                  onCommentSubmit={handleAddComment}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout {...mainLayoutProps}>
                <ProfilePage
                  allPosts={posts}
                  onCommentSubmit={handleAddComment}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
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
        <CreatePostModal
          onClose={closeCreatePostModal}
          onAddPost={handleAddPost}
        />
      )}
    </div>
  );
}

export default App;
