// src/App.jsx - Versão com Autenticação do Firebase Integrada

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importações do Firebase para monitorar a autenticação
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config'; // Confirme que este é o caminho para sua config do Firebase

// Layouts e Rotas
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './routes/PrivateRoute';

// Componentes
import Footer from './components/Footer';
import CreatePostModal from './components/CreatePostModal';

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

function App() {
  // --- ESTADOS ---
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );
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

  // -- NOVOS ESTADOS DE AUTENTICAÇÃO --
  const [user, setUser] = useState(null);
  const [authIsReady, setAuthIsReady] = useState(false);

  // --- EFEITOS ---

  // Efeito para o tema escuro
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // NOVO EFEITO: Monitora o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (_user) => {
      setUser(_user);
      setAuthIsReady(true);
      console.log(
        'Estado de autenticação verificado, usuário:',
        _user ? _user.uid : 'Nenhum'
      );
    });
    return () => unsubscribe();
  }, []);

  // --- FUNÇÕES ---
  const toggleTheme = () => setDarkMode(!darkMode);
  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  const themeClasses = darkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

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

      {/* Só renderiza o app após a verificação inicial do Firebase, evitando "piscar" de tela */}
      {authIsReady && (
        <>
          <Routes>
            {/* GRUPO 1: Rotas públicas sem layout principal */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/actions" element={<ActionHandlerPage />} />

            {/* GRUPO 2: Rotas Públicas com o MainLayout */}
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

            {/* GRUPO 3: Rotas Protegidas com o MainLayout */}
            <Route element={<PrivateRoute user={user} />}>
              {' '}
              {/* Passando o usuário para a rota privada */}
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
                      user={user} // Passando o usuário para a página de perfil
                      allPosts={posts}
                      onCommentSubmit={() => {}}
                      sessionFollowStatus={sessionFollowStatus}
                      setSessionFollowStatus={setSessionFollowStatus}
                    />
                  }
                />
                <Route
                  path="/marketplace/criar"
                  element={<CreateListingPage />}
                />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>
          </Routes>

          <Footer darkMode={darkMode} />

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
        </>
      )}
    </div>
  );
}

export default App;
