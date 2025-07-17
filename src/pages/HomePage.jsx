// src/pages/HomePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// --- Imports dos Componentes da Página ---
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import StoriesReel from '../components/StoriesReel';
import StoryModal from '../components/StoryModal';
import CreateStoryModal from '../components/CreateStoryModal';

// --- Componentes Internos da Página (sem alterações) ---
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-avatar.png';
          }}
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

const FeedSection = ({ posts, isLoading, onAddComment, onDeletePost }) => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();

  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-400">Carregando OLLOs...</div>
    );
  }
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Ainda não há OLLOs para ver. Seja o primeiro!
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          postData={post}
          onAddComment={onAddComment}
          onDeletePost={onDeletePost}
          darkMode={darkMode}
          currentUser={currentUser}
          isLast={index === posts.length - 1}
        />
      ))}
    </div>
  );
};

const RightSidebar = () => {
  /* ...código mantido, sem alterações... */
};

// --- Dados de Exemplo para Stories ---
const mockStories = [
  {
    id: 1,
    userName: 'Ana',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
    userAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    userName: 'Carlos',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
    userAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
  },
];

const HomePage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stories, setStories] = useState(mockStories);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);

  // Lógica de carregamento de posts robusta
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);
    const postsCollectionRef = collection(db, 'posts');
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
        setPostsLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar posts:', error);
        setPostsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  // Handlers (sem alterações)
  const handleCommentSubmit = useCallback(
    async (postId, commentText) => {
      /* ...código mantido... */
    },
    [currentUser, navigate]
  );
  const handleDeletePost = useCallback(async (postId) => {
    /* ...código mantido... */
  }, []);
  const handleNewPost = () => setIsModalOpen(false);
  const handleOpenModal = () => {
    if (currentUser) setIsModalOpen(true);
  };
  const handleStoryClick = (story) => setCurrentStory(story);
  const handleCloseStoryModal = () => setCurrentStory(null);
  const handleOpenCreateStory = () => setIsStoryModalOpen(true);
  const handleCloseCreateStory = () => setIsStoryModalOpen(false);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        <main className="space-y-6">
          {/* CORREÇÃO FINAL: StoriesReel descomentado e renderizado */}
          <StoriesReel
            stories={stories}
            onStoryClick={handleStoryClick}
            onCreateStoryClick={handleOpenCreateStory}
          />

          <CreatePostWidget
            currentUser={currentUser}
            onOpenModal={handleOpenModal}
          />

          <FeedSection
            posts={posts}
            isLoading={postsLoading}
            onAddComment={handleCommentSubmit}
            onDeletePost={handleDeletePost}
          />
        </main>
        <RightSidebar />
      </div>

      {/* Modais */}
      {isModalOpen && currentUser && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleNewPost}
          currentUser={currentUser}
        />
      )}
      {currentStory && (
        <StoryModal story={currentStory} onClose={handleCloseStoryModal} />
      )}
      {isStoryModalOpen && (
        <CreateStoryModal onClose={handleCloseCreateStory} />
      )}
    </div>
  );
};

export default HomePage;
