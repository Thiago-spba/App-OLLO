// src/pages/HomePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  enrichPostData,
  addCommentToPost,
  togglePostLike,
  deletePostById,
} from '../services/firestoreService';

// --- Componentes da UI ---
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import StoriesReel from '../components/StoriesReel';
import StoryModal from '../components/StoryModal';
import CreateStoryModal from '../components/CreateStoryModal';

// ========================================================================
// COMPONENTES INTERNOS DA PÁGINA
// ========================================================================

const CreatePostWidget = ({ currentUser, onOpenModal }) => {
  const getFirstName = (name) =>
    typeof name === 'string' && name.trim().length > 0
      ? name.split(' ')[0]
      : 'OLLO';
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
          No que você está pensando,{' '}
          {currentUser ? getFirstName(currentUser.name) : 'OLLO'}?
        </button>
      </div>
    </section>
  );
};

const RightSidebar = ({ navigate }) => {
  const { currentUser } = useAuth();
  const handleProtectedClick = useCallback(
    (e) => {
      if (!currentUser) {
        e.preventDefault();
        navigate('/login');
      }
    },
    [currentUser, navigate]
  );

  return (
    <aside className="hidden lg:block space-y-6">
      {/* Conteúdo da Sidebar virá aqui */}
    </aside>
  );
};

// --- DADOS DE EXEMPLO (MOCKS) ---
const mockStories = []; // Simplesmente um array vazio];

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
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false); // <-- ESTADO ADICIONADO
  const [currentStory, setCurrentStory] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }
    setPostsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const rawPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const enrichedPosts = await Promise.all(rawPosts.map(enrichPostData));
        setPosts(enrichedPosts);
        setPostsLoading(false);
      },
      (error) => {
        console.error('Erro Crítico ao buscar posts:', error);
        setPostsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  // --- Handlers de Ações ---
  const handleCommentSubmit = useCallback(
    async (postId, commentText) => {
      if (!currentUser) return navigate('/login');
      const commentData = {
        authorid: currentUser.uid,
        text: commentText,
        createdAt: Timestamp.now(),
      };
      try {
        await addCommentToPost(postId, commentData);
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
      }
    },
    [currentUser, navigate]
  );

  const handleToggleLike = useCallback(
    async (postId) => {
      if (!currentUser) return navigate('/login');
      try {
        await togglePostLike(postId, currentUser.uid);
      } catch (error) {
        console.error('Erro ao curtir/descurtir:', error);
      }
    },
    [currentUser, navigate]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      if (!currentUser) return navigate('/login');
      const postToDelete = posts.find((p) => p.id === postId);
      if (postToDelete?.authorid === currentUser.uid) {
        if (window.confirm('Tem certeza que deseja deletar este post?')) {
          try {
            await deletePostById(postId);
          } catch (error) {
            console.error('Erro ao deletar post:', error);
          }
        }
      } else {
        alert('Você não pode deletar o post de outra pessoa.');
      }
    },
    [currentUser, navigate, posts]
  );

  const handleOpenModal = () =>
    currentUser ? setIsModalOpen(true) : navigate('/login');
  const handleStoryClick = (story) => {
    if (!currentUser) return navigate('/login');
    setCurrentStory(story);
    setIsStoryModalOpen(true); // Abre o modal de visualização
  };

  // --- FUNÇÃO CORRIGIDA ---
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
                  Não há OLLOs para exibir. Seja o primeiro a postar!
                </div>
              )}
            </div>
          )}
        </main>
        <RightSidebar navigate={navigate} />
      </div>

      {/* MODAIS */}
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
      {/* RENDERIZAÇÃO DO MODAL DE CRIAÇÃO */}
      {isCreateStoryModalOpen && currentUser && (
        <CreateStoryModal onClose={() => setIsCreateStoryModalOpen(false)} />
      )}
    </div>
  );
};

export default HomePage;
