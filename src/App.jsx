// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import CreatePostModal from './components/CreatePostModal';
import MainLayout from './layouts/MainLayout';

// --- COMPONENTES PLACEHOLDER PARA NOVAS ROTAS ---
function PostDetailPagePlaceholder() {
  const { postId } = useParams();
  const [darkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  return (
    <div className={`text-center p-10 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'} rounded-lg shadow-xl my-8 max-w-md mx-auto`}>
      <h2 className={`text-2xl font-semibold ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-accent'} mb-4`}>Página de Detalhes do Post</h2>
      <p>
        O conteúdo completo do post com ID: <strong className={darkMode ? 'text-ollo-bg-light' : 'text-ollo-primary'}>{postId}</strong> apareceria aqui.
      </p>
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-6`}>
        (Esta é uma página placeholder. A funcionalidade completa precisa ser desenvolvida.)
      </p>
    </div>
  );
}

function TermsPagePlaceholder() {
  const [darkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  return (
    <div className={`text-center p-10 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'} rounded-lg shadow-xl my-8 max-w-md mx-auto`}>
      <h2 className={`text-2xl font-semibold ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-accent'} mb-4`}>Termos de Serviço</h2>
      <p>
        O conteúdo detalhado dos Termos de Serviço do OLLO apareceria aqui.
      </p>
      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-6`}>
        (Esta é uma página placeholder. A funcionalidade completa precisa ser desenvolvida.)
      </p>
    </div>
  );
}
// --- FIM DOS COMPONENTES PLACEHOLDER ---

function App() {
  // Estado para controlar o tema (escuro/claro)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // Posts de exemplo
  const [posts, setPosts] = useState([
    { id: 1, postId: 'bem-vindo-ollo', userName: "Gemini Auxiliar", timestamp: "Agora mesmo", content: "Bem-vindo ao OLLO! Uma nova plataforma para conectar e compartilhar. Explore, crie e divirta-se!", comments: [] },
    { id: 2, postId: 'usando-useState', userName: "Usuário OLLO", timestamp: "Há 10 minutos", content: "Aprendendo a usar o useState no React para gerenciar o estado dos meus posts. Muito interessante!", comments: [] },
    { id: 3, postId: 'componentizacao-react', userName: "Dev Entusiasta", timestamp: "Há 1 hora", content: "A componentização no React realmente facilita a organização do código e a reutilização. #ReactDev", comments: [] },
    { id: 4, postId: 'meu-outro-post', userName: "Usuário OLLO", timestamp: "Há 5 minutos", content: "Outro post meu para testar a plataforma OLLO! A interface está ficando ótima.", comments: [] },
    { id: 'ollo-exploration', postId: 'ollo-exploration', userName: "Usuário OLLO", timestamp: "Há 2 dias", content: "Post original 'Explorando OLLO' que recebeu interações.", comments: [] },
    { id: 'my-ideas-post', postId: 'my-ideas-post', userName: "Usuário OLLO", timestamp: "Há 1 dia", content: "Post 'Minhas Ideias' onde o Dev Entusiasta comentou.", comments: [] }
  ]);

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Salvar preferência de tema no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleAddPost = (newPostText) => {
    if (!newPostText.trim()) return;
    const newPost = { 
      id: Date.now(), 
      postId: `post-${Date.now()}`,
      userName: "Usuário OLLO", 
      timestamp: "Agora mesmo", 
      content: newPostText, 
      comments: [] 
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    if (isCreatePostModalOpen) {
      closeCreatePostModal();
    }
  };

  const handleAddComment = (targetPostId, commentText) => {
    if (!commentText.trim()) return;
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.postId === targetPostId.toString()) { 
        const newComment = { 
          commentId: `comment-${Date.now()}`,
          user: "Eu Mesmo", 
          text: commentText,
          likes: 0,
          dislikes: 0,
          userReaction: null
        };
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    }));
  };

  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>      
      <MainLayout 
        openCreatePostModal={openCreatePostModal} 
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      >
        <Routes>
          <Route 
            path="/" 
            element={<HomePage posts={posts} onAddPost={handleAddPost} onCommentSubmit={handleAddComment} darkMode={darkMode} />} 
          />
          <Route
            path="/explore"
            element={<ExplorePage allPosts={posts} onCommentSubmit={handleAddComment} darkMode={darkMode} />}
          />
          <Route 
            path="/profile/:profileId" 
            element={<ProfilePage allPosts={posts} onCommentSubmit={handleAddComment} darkMode={darkMode} />} 
          />
          <Route 
            path="/profile" 
            element={<ProfilePage allPosts={posts} onCommentSubmit={handleAddComment} darkMode={darkMode} />} 
          />
          <Route 
            path="/notifications" 
            element={<NotificationsPage darkMode={darkMode} />} 
          />
          <Route 
            path="/posts/:postId" 
            element={<PostDetailPagePlaceholder />} 
          />
          <Route 
            path="/terms" 
            element={<TermsPagePlaceholder />} 
          />
        </Routes>
      </MainLayout>
      
      <Footer darkMode={darkMode} />

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

export default App;