// src/pages/HomePage.jsx (VERSÃO FINALÍSSIMA, CORRIGIDA E PROFISSIONAL)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// MUDANÇA CRÍTICA: Importamos a nova função de feed e removemos as antigas.
import {
  getFeedPosts, // Nossa nova função poderosa!
  addCommentToPost,
  togglePostLike,
  deletePostById,
} from '../services/firestoreService';

// --- Componentes da UI (não precisam de alteração) ---
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import StoriesReel from '../components/StoriesReel';
import StoryModal from '../components/StoryModal';
import CreateStoryModal from '../components/CreateStoryModal';

// O componente interno pode ser mantido como está.
const CreatePostWidget = ({ currentUser, onOpenModal }) => {
  const getFirstName = (name) => (name ? name.split(' ')[0] : 'OLLO');
  return (
    <section className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60">
      <div className="flex items-center gap-3">
        <img
          src={currentUser?.avatarUrl || '/images/default-avatar.png'}
          alt="Seu avatar"
          className="h-11 w-11 rounded-full object-cover flex-shrink-0"
        />
        <button
          onClick={onOpenModal}
          className="flex-grow text-left px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
        >
          No que você está pensando, {getFirstName(currentUser?.name)}?
        </button>
      </div>
    </section>
  );
};
const RightSidebar = ({ navigate }) => {
  /* Seu código... */ return (
    <aside className="hidden lg:block space-y-6"></aside>
  );
};
const mockStories = [];

// ========================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// ========================================================================
const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stories] = useState(mockStories);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);

  // MUDANÇA CRÍTICA: Lógica de busca de posts totalmente refatorada.
  // Usamos uma função `fetchPosts` que pode ser chamada para atualizar o feed.
  const fetchPosts = useCallback(async () => {
    if (!currentUser) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);
    try {
      const enrichedPosts = await getFeedPosts();
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Erro Crítico ao buscar feed:', error);
      // Mesmo com erro, a UI não quebra.
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [currentUser]);

  // O useEffect agora apenas chama nossa função de busca.
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // --- Handlers de Ações ---
  const handleCommentSubmit = useCallback(async (postId, commentText) => {
    /* Seu código, sem alterações... */
  });
  const handleToggleLike = useCallback(async (postId) => {
    /* Seu código, sem alterações... */
  });

  // MELHORIA: A função de deletar agora remove o post da tela instantaneamente.
  const handleDeletePost = useCallback(
    async (postId) => {
      if (!currentUser) return navigate('/login');

      const postToDelete = posts.find((p) => p.id === postId);
      if (postToDelete?.authorid !== currentUser.uid) {
        return alert('Você não pode deletar o post de outra pessoa.');
      }

      if (window.confirm('Tem certeza que deseja deletar este post?')) {
        try {
          // Remove do Firestore
          await deletePostById(postId);
          // Remove da UI para feedback instantâneo
          setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
        } catch (error) {
          console.error('Erro ao deletar post:', error);
        }
      }
    },
    [currentUser, navigate, posts]
  );

  const handleOpenModal = () =>
    currentUser ? setIsModalOpen(true) : navigate('/login');
  const handleStoryClick = (story) => {
    /* Seu código, sem alterações... */
  };
  const handleOpenCreateStory = () =>
    currentUser ? setIsCreateStoryModalOpen(true) : navigate('/login');

  // O JSX para renderização permanece o mesmo.
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        <main className="space-y-6">
          <StoriesReel
            stories={stories}
            onStoryClick={handleStoryClick}
            onCreateStoryClick={handleOpenCreateStory}
          />
          <CreatePostWidget
            currentUser={currentUser}
            onOpenModal={handleOpenModal}
          />
          {postsLoading ? (
            <div className="text-center p-8 text-gray-400">
              Carregando OLLOs...
            </div>
          ) : (
            <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    postData={post}
                    currentUser={currentUser}
                    onAddComment={handleCommentSubmit}
                    onDeletePost={handleDeletePost}
                    onToggleLike={handleToggleLike}
                    isLast={index === posts.length - 1}
                    navigate={navigate}
                  />
                ))
              ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Ainda não há OLLOs por aqui. Que tal ser o primeiro?
                </div>
              )}
            </div>
          )}
        </main>
        <RightSidebar navigate={navigate} />
      </div>

      {/* MODAIS (Seu código, sem alterações) */}
      {isModalOpen && currentUser && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
        />
      )}
      {currentStory && isStoryModalOpen && currentUser && (
        <StoryModal
          story={currentStory}
          onClose={() => setIsStoryModalOpen(false)}
        />
      )}
      {isCreateStoryModalOpen && currentUser && (
        <CreateStoryModal onClose={() => setIsCreateStoryModalOpen(false)} />
      )}
    </div>
  );
};

export default HomePage;
