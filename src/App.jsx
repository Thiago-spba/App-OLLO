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

// NOVOS IMPORTS (já existentes no seu código)
import PostDetailPage from './pages/PostDetailPage';
import TermsPage from './pages/TermsPage';

function App() {
    // Estado para controlar o tema (escuro/claro)
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

    // Estado para gerenciar quem está sendo seguido na sessão atual (ELEVADO PARA O APP)
    const [sessionFollowStatus, setSessionFollowStatus] = useState({});

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
        if (darkMode) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }
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
            userName: "Usuário OLLO", // Ou o usuário logado dinamicamente
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
                    user: "Eu Mesmo", // Idealmente, seria o usuário logado dinamicamente
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
        <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                        element={
                            <ProfilePage
                                allPosts={posts}
                                onCommentSubmit={handleAddComment}
                                darkMode={darkMode}
                                sessionFollowStatus={sessionFollowStatus} // Passando o estado
                                setSessionFollowStatus={setSessionFollowStatus} // Passando a função de atualização
                            />
                        }
                    />
                    <Route
                        path="/profile" 
                        element={
                            <ProfilePage
                                allPosts={posts}
                                onCommentSubmit={handleAddComment}
                                darkMode={darkMode}
                                sessionFollowStatus={sessionFollowStatus} // Passando o estado
                                setSessionFollowStatus={setSessionFollowStatus} // Passando a função de atualização
                            />
                        }
                    />
                    <Route
                        path="/notifications"
                        element={<NotificationsPage darkMode={darkMode} />}
                    />
                    
                    <Route
                        path="/posts/:postId"
                        element={<PostDetailPage darkMode={darkMode} allPosts={posts} />}
                    />
                    
                    <Route
                        path="/terms"
                        element={<TermsPage darkMode={darkMode} />}
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