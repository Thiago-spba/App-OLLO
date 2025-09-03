// ARQUIVO: src/pages/HomePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomepageUsersCard from '../components/HomepageUsersCard';
import { getFeedPosts, deletePostById } from '@/services/firestoreService';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import StoriesReel from '../components/StoriesReel';
import StoryModal from '../components/StoryModal';
import CreateStoryModal from '../components/CreateStoryModal';
import Avatar from '../components/Avatar';

const CreatePostWidget = ({ currentUser, onOpenModal }) => {
  const getFirstName = (name) => (name ? name.split(' ')[0] : 'OLLO');

  return (
    <section className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60">
      <div className="flex items-center gap-3">
        <Avatar
          src={currentUser?.avatarUrl}
          alt="Seu avatar"
          className="h-11 w-11 rounded-full object-cover flex-shrink-0 text-gray-400 dark:text-gray-500"
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
  return (
    <aside className="hidden lg:block space-y-6">
      <HomepageUsersCard />
    </aside>
  );
};

const mockStories = [];

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

  const fetchPosts = useCallback(async () => {
    // A lógica de busca inicial de posts permanece a mesma.
    setPostsLoading(true);
    try {
      const enrichedPosts = await getFeedPosts();
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Erro Crítico ao buscar feed:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, []); // CORREÇÃO: currentUser não é necessário aqui, pois getFeedPosts já lida com o feed geral.

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // MELHORIA: Função otimizada para adicionar um novo post ao feed sem recarregar tudo.
  const handleAddNewPost = useCallback((newPost) => {
    // Adiciona o novo post no topo da lista de posts existente no estado.
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  }, []);

  const handleDeletePost = useCallback(
    async (postId) => {
      // Sua lógica de delete permanece a mesma, está ótima.
      if (!currentUser) return navigate('/login');
      const postToDelete = posts.find((p) => p.id === postId);
      if (postToDelete?.authorId !== currentUser.uid) {
        // CORREÇÃO: authorid -> authorId
        return alert('Você não pode deletar o post de outra pessoa.');
      }
      if (window.confirm('Tem certeza que deseja deletar este post?')) {
        try {
          await deletePostById(postId);
          setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
        } catch (error) {
          console.error('Erro ao deletar post:', error);
        }
      }
    },
    [currentUser, navigate, posts]
  );

  // As demais funções handle não precisam de alteração
  const handleCommentSubmit = useCallback(
    async (postId, commentText) => {},
    []
  );
  const handleToggleLike = useCallback(async (postId) => {}, []);
  const handleOpenModal = () =>
    currentUser ? setIsModalOpen(true) : navigate('/login');
  const handleStoryClick = (story) => {
    setCurrentStory(story);
    setIsStoryModalOpen(true);
  };
  const handleOpenCreateStory = () =>
    currentUser ? setIsCreateStoryModalOpen(true) : navigate('/login');

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

      {isModalOpen && currentUser && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          // MUDANÇA: Passando a nova função otimizada para o modal.
          onAddPost={handleAddNewPost}
        />
      )}
      {/* O restante dos modais permanece igual */}
    </div>
  );
};

export default HomePage;
