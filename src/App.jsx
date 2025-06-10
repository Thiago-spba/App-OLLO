// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Seus Componentes
import Footer from './components/Footer';
import CreatePostModal from './components/CreatePostModal';

// Seus Layouts
import MainLayout from './layouts/MainLayout';

// Suas Páginas
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
import CreateListingPage from './pages/CreateListingPage'; // <--- ÚNICO IMPORT NO LUGAR CORRETO

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
    //... seus outros posts de exemplo
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

  // ... suas outras funções (handleAddPost, etc.) ...
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

        {/* ROTA NOVA NO LUGAR CORRETO */}
        <Route
          path="/marketplace/criar"
          element={
            <MainLayout {...mainLayoutProps}>
              <CreateListingPage />
            </MainLayout>
          }
        />

        <Route
          path="/profile/:profileId"
          element={
            <MainLayout {...mainLayoutProps}>
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout {...mainLayoutProps}>
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />
            </MainLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MainLayout {...mainLayoutProps}>
              <NotificationsPage />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
