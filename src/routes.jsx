import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';

// Layouts e Componentes
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import CreatePostModal from './components/CreatePostModal';
import PWABanner from './components/PWABanner';

// Páginas
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
import ActionHandlerPage from './pages/ActionHandlerPage';

export default function Rotas() {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
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

  // Funções auxiliares
  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);
  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
    closeCreatePostModal();
  };

  const themeClasses = darkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

  // Rotas que não devem mostrar layout principal
  const noLayoutRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/reset-password',
    '/actions',
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
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

      <Routes location={location} key={location.pathname}>
        {/* Rotas sem layout principal */}
        {noLayoutRoutes.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              path === '/login' ? (
                <LoginPage />
              ) : path === '/register' ? (
                <RegisterPage />
              ) : path === '/forgot-password' ? (
                <ForgotPasswordPage />
              ) : path === '/verify-email' ? (
                <VerifyEmailPage />
              ) : path === '/reset-password' ? (
                <ResetPasswordPage />
              ) : (
                <ActionHandlerPage />
              )
            }
          />
        ))}

        {/* Rotas públicas com layout principal */}
        <Route
          element={
            <MainLayout {...{ openCreatePostModal, toggleTheme, darkMode }} />
          }
        >
          <Route
            path="/"
            element={
              <HomePage
                posts={posts}
                onTriggerCreatePost={openCreatePostModal}
              />
            }
          />
          <Route path="/explore" element={<ExplorePage allPosts={posts} />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/posts/:postId"
            element={<PostDetailPage allPosts={posts} />}
          />
          <Route
            path="/marketplace/detalhes/:listingId"
            element={<ListingDetailPage />}
          />
        </Route>

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <MainLayout {...{ openCreatePostModal, toggleTheme, darkMode }} />
            }
          >
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/criar" element={<CreateListingPage />} />
            <Route
              path="/profile/:profileId?"
              element={
                <ProfilePage
                  allPosts={posts}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              }
            />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>

      {!noLayoutRoutes.includes(location.pathname) && (
        <>
          <PWABanner />
          <Footer darkMode={darkMode} />
        </>
      )}

      {isCreatePostModalOpen && (
        <CreatePostModal
          onClose={closeCreatePostModal}
          onAddPost={handleAddPost}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
