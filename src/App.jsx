import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Layouts e Rotas
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './routes/PrivateRoute';

// Componentes globais
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

function AppContent() {
  const { darkMode, toggleTheme } = useTheme();

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

  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  const themeClasses = darkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClasses}`}
    >
      {/* Toast global para avisos do app */}
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

      {/* Rotas públicas e privadas */}
      <Routes>
        {/* Rotas sem layout principal */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/actions" element={<ActionHandlerPage />} />

        {/* Rotas públicas com MainLayout */}
        <Route
          element={
            <MainLayout
              openCreatePostModal={openCreatePostModal}
              toggleTheme={toggleTheme}
              darkMode={darkMode}
            />
          }
        >
          <Route
            path="/"
            element={
              <HomePage
                posts={posts}
                onTriggerCreatePost={openCreatePostModal}
                onCommentSubmit={() => {}}
                onDeletePost={() => {}}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ExplorePage allPosts={posts} onCommentSubmit={() => {}} />
            }
          />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route
            path="/marketplace/detalhes/:listingId"
            element={<ListingDetailPage />}
          />
          <Route
            path="/posts/:postId"
            element={<PostDetailPage allPosts={posts} />}
          />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Rotas protegidas com MainLayout */}
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
            <Route
              path="/profile/:profileId?"
              element={
                <ProfilePage
                  allPosts={posts}
                  onCommentSubmit={() => {}}
                  sessionFollowStatus={sessionFollowStatus}
                  setSessionFollowStatus={setSessionFollowStatus}
                />
              }
            />
            <Route path="/marketplace/criar" element={<CreateListingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>

      {/* Banner PWA aparece sempre acima do footer */}
      <PWABanner />

      {/* Footer global */}
      <Footer darkMode={darkMode} />

      {/* Modal para criar post */}
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

// ThemeProvider global
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
