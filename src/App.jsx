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

function App() {
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [sessionFollowStatus, setSessionFollowStatus] = useState({});
    const [posts, setPosts] = useState([
        { id: 1, postId: 'bem-vindo-ollo', userName: "Gemini Auxiliar", timestamp: "Agora mesmo", content: "Bem-vindo ao OLLO! Uma nova plataforma para conectar e compartilhar. Explore, crie e divirta-se!", comments: [], likeCount: Math.floor(Math.random() * 101) },
        { id: 2, postId: 'usando-useState', userName: "Usuário OLLO", timestamp: "Há 10 minutos", content: "Aprendendo a usar o useState no React para gerenciar o estado dos meus posts. Muito interessante!", comments: [], likeCount: Math.floor(Math.random() * 101) },
        { id: 3, postId: 'componentizacao-react', userName: "Dev Entusiasta", timestamp: "Há 1 hora", content: "A componentização no React realmente facilita a organização do código e a reutilização. #ReactDev", comments: [], likeCount: Math.floor(Math.random() * 101) },
        { id: 4, postId: 'meu-outro-post', userName: "Usuário OLLO", timestamp: "Há 5 minutos", content: "Outro post meu para testar a plataforma OLLO! A interface está ficando ótima.", comments: [], likeCount: Math.floor(Math.random() * 101) },
        { id: 'ollo-exploration', postId: 'ollo-exploration', userName: "Usuário OLLO", timestamp: "Há 2 dias", content: "Post original 'Explorando OLLO' que recebeu interações.", comments: [], likeCount: Math.floor(Math.random() * 101) },
        { id: 'my-ideas-post', postId: 'my-ideas-post', userName: "Usuário OLLO", timestamp: "Há 1 dia", content: "Post 'Minhas Ideias' onde o Dev Entusiasta comentou.", comments: [], likeCount: Math.floor(Math.random() * 101) }
    ]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

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

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleAddPost = (newPostText) => {
        if (!newPostText.trim()) return;
        const newPost = {
            id: Date.now(),
            postId: `post-${Date.now()}`,
            userName: "Usuário OLLO", // Idealmente, viria do usuário autenticado
            timestamp: "Agora mesmo",
            content: newPostText,
            comments: [],
            likeCount: 0
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
                    user: "Usuário OLLO", 
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

    const handleDeletePost = (targetPostId) => {
        if (window.confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
            setPosts(prevPosts => prevPosts.filter(post => post.postId !== targetPostId));
            console.log(`Post com postId: ${targetPostId} foi marcado para exclusão.`);
        }
    };

    const openCreatePostModal = () => setIsCreatePostModalOpen(true);
    const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

    const mainLayoutProps = {
        openCreatePostModal,
        darkMode,
        toggleTheme
    };

    return (
        <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'text-ollo-bg-light' : 'text-gray-900'}`}>
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout {...mainLayoutProps}>
                            <HomePage
                                posts={posts}
                                // AQUI ESTÁ A MUDANÇA PRINCIPAL:
                                // Passando openCreatePostModal para a prop que HomePage usará para abrir o modal.
                                // No HomePage.jsx que te enviei, a prop se chama 'onTriggerCreatePost'.
                                // Se você manteve 'onAddPost' no HomePage.jsx para essa finalidade,
                                // então 'onAddPost={openCreatePostModal}' estaria correto.
                                // Vou usar 'onTriggerCreatePost' para ser consistente com o HomePage.jsx mais recente.
                                onTriggerCreatePost={openCreatePostModal} 
                                onCommentSubmit={handleAddComment}
                                onDeletePost={handleDeletePost}
                                darkMode={darkMode}
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
                                darkMode={darkMode}
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
                                onCommentSubmit={handleAddComment}
                                darkMode={darkMode}
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
                                darkMode={darkMode}
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
                            <NotificationsPage darkMode={darkMode} />
                        </MainLayout>
                    }
                />
                <Route
                    path="/posts/:postId"
                    element={
                        <MainLayout {...mainLayoutProps}>
                            <PostDetailPage darkMode={darkMode} allPosts={posts} />
                        </MainLayout>
                    }
                />
                <Route
                    path="/terms"
                    element={
                        <MainLayout {...mainLayoutProps}>
                            <TermsPage darkMode={darkMode} />
                        </MainLayout>
                    }
                />
                <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
                {/* <Route path="/register" element={<RegisterPage darkMode={darkMode} />} /> // Espaço para a futura página de cadastro */}
            </Routes>

            <Footer darkMode={darkMode} />

            {isCreatePostModalOpen && (
                <CreatePostModal
                    onClose={closeCreatePostModal}
                    onAddPost={handleAddPost} // O Modal usa handleAddPost para efetivamente criar o post
                    darkMode={darkMode}
                />
            )}
        </div>
    );
}

export default App;