// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePostModal from './components/CreatePostModal';
import MainLayout from './layouts/MainLayout';
import PostDetailPage from './pages/PostDetailPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';

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
    {
      id: 2,
      postId: 'usando-useState',
      userName: 'Usuário OLLO',
      timestamp: 'Há 10 minutos',
      content:
        'Aprendendo a usar o useState no React para gerenciar o estado dos meus posts. Muito interessante!',
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
    },
    {
      id: 3,
      postId: 'componentizacao-react',
      userName: 'Dev Entusiasta',
      timestamp: 'Há 1 hora',
      content:
        'A componentização no React realmente facilita a organização do código e a reutilização. #ReactDev',
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
    },
    {
      id: 4,
      postId: 'meu-outro-post',
      userName: 'Usuário OLLO',
      timestamp: 'Há 5 minutos',
      content:
        'Outro post meu para testar a plataforma OLLO! A interface está ficando ótima.',
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
    },
    {
      id: 'ollo-exploration',
      postId: 'ollo-exploration',
      userName: 'Usuário OLLO',
      timestamp: 'Há 2 dias',
      content: "Post original 'Explorando OLLO' que recebeu interações.",
      comments: [],
      likeCount: Math.floor(Math.random() * 101),
    },
    {
      id: 'my-ideas-post',
      postId: 'my-ideas-post',
      userName: 'Usuário OLLO',
      timestamp: 'Há 1 dia',
      content: "Post 'Minhas Ideias' onde o Dev Entusiasta comentou.",
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
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // *** FUNÇÕES RESTAURADAS ***
  const handleAddPost = (newPostText) => {
    if (!newPostText.trim()) return;
    const newPost = {
      id: Date.now(),
      postId: `post-${Date.now()}`,
      userName: 'Usuário OLLO',
      timestamp: 'Agora mesmo',
      content: newPostText,
      comments: [],
      likeCount: 0,
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    if (isCreatePostModalOpen) closeCreatePostModal();
  };

  const handleAddComment = (targetPostId, commentText) => {
    if (!commentText.trim()) return;
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.postId === targetPostId.toString()) {
          const newComment = {
            commentId: `comment-${Date.now()}`,
            user: 'Usuário OLLO',
            text: commentText,
            likes: 0,
            dislikes: 0,
            userReaction: null,
          };
          return { ...post, comments: [...(post.comments || []), newComment] };
        }
        return post;
      })
    );
  };

  const handleDeletePost = (targetPostId) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.postId !== targetPostId)
      );
    }
  };
  // *** FIM DAS FUNÇÕES RESTAURADAS ***

  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

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
              {' '}
              <HomePage
                posts={posts}
                onTriggerCreatePost={openCreatePostModal}
                onCommentSubmit={handleAddComment}
                onDeletePost={handleDeletePost}
              />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/explore"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <ExplorePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
              />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/marketplace"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <MarketplacePage />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/profile/:profileId"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <ProfilePage
                allPosts={posts}
                onCommentSubmit={handleAddComment}
                sessionFollowStatus={sessionFollowStatus}
                setSessionFollowStatus={setSessionFollowStatus}
              />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <NotificationsPage />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <PostDetailPage allPosts={posts} />{' '}
            </MainLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <MainLayout {...mainLayoutProps}>
              {' '}
              <TermsPage />{' '}
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
