import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkle,
  ArrowClockwise,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostCard from '../components/PostCard';
import StoriesReel from '../components/StoriesReel';
import CreatePostModal from '../components/CreatePostModal';

const HomePage = ({ onCommentSubmit, onDeletePost }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Busca em tempo real dos posts do Firestore
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Novo post: só fecha modal (ao salvar, o onSnapshot já recarrega o feed)
  const handleNewPost = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-x-6 xl:gap-x-8 pt-1 px-4 sm:px-6 lg:px-8">
      <main className="w-full flex-grow lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0">
        <div className="space-y-6 md:space-y-8">
          <StoriesReel />

          <section className="p-5 rounded-2xl bg-white dark:bg-ollo-dark-800 shadow-lg border border-ollo-light-200/50 dark:border-ollo-dark-600/50 transition-all hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-ollo-primary-400">
                <img
                  src={currentUser?.avatarUrl || '/images/default-avatar.png'}
                  alt="avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-avatar.png';
                  }}
                />
              </div>
              <button
                onClick={handleOpenModal}
                className="flex-grow px-5 py-3 rounded-xl text-left bg-ollo-light-100 hover:bg-ollo-light-200 dark:bg-ollo-dark-700 dark:hover:bg-ollo-dark-600 text-ollo-dark-600 dark:text-ollo-light-300 transition-colors"
              >
                <span className="font-medium">
                  {currentUser
                    ? `No que você está pensando, ${currentUser.name?.split(' ')[0] || 'Usuário'}?`
                    : 'Faça login para compartilhar'}
                </span>
              </button>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 text-ollo-primary-600 dark:text-ollo-primary-400 hover:bg-ollo-primary-50 dark:hover:bg-ollo-dark-700 rounded-lg transition-colors"
              >
                <ImageIcon size={20} weight="duotone" />
                <span>Foto/Vídeo</span>
              </button>
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 text-ollo-accent-600 dark:text-ollo-accent-400 hover:bg-ollo-accent-50 dark:hover:bg-ollo-dark-700 rounded-lg transition-colors"
              >
                <Sparkle size={20} weight="duotone" />
                <span>Momento</span>
              </button>
            </div>
          </section>

          <section aria-labelledby="feed-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-ollo-dark-900 dark:text-ollo-light-100">
                Atualizações Recentes
              </h2>
              <button
                className="text-ollo-primary-500 hover:text-ollo-primary-600 dark:text-ollo-primary-400 dark:hover:text-ollo-primary-300 transition-colors"
                onClick={() => window.location.reload()}
                title="Recarregar Feed"
              >
                <ArrowClockwise size={20} />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6 md:space-y-8">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postData={post}
                    currentUserId={currentUser?.uid}
                    onCommentSubmit={onCommentSubmit}
                    onDeletePost={onDeletePost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 rounded-2xl bg-white/80 dark:bg-ollo-dark-800/80 shadow-md border border-ollo-light-200/50 dark:border-ollo-dark-600/50">
                <div className="mx-auto w-24 h-24 bg-ollo-primary-100 dark:bg-ollo-dark-700 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle
                    size={48}
                    className="text-ollo-primary-500 dark:text-ollo-primary-400"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-ollo-dark-800 dark:text-ollo-light-100">
                  Bem-vindo ao OLLO!
                </h3>
                <p className="text-ollo-dark-600 dark:text-ollo-light-300 mb-6">
                  Seu feed está vazio. Comece compartilhando algo incrível!
                </p>
                <button
                  onClick={handleOpenModal}
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-ollo-primary-500 to-ollo-primary-600 hover:from-ollo-primary-600 hover:to-ollo-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Criar Primeiro Post
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0 pl-6">
        <div className="sticky top-4 space-y-6">
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-ollo-dark-800/80 border border-ollo-light-200/50 dark:border-ollo-dark-600/50">
            <h3 className="font-bold text-lg mb-4 text-ollo-dark-800 dark:text-ollo-light-100">
              Novidades no OLLO
            </h3>
          </div>
        </div>
      </aside>

      {isModalOpen && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleNewPost}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

const PostCardSkeleton = () => (
  <div className="p-5 rounded-2xl bg-white/80 dark:bg-ollo-dark-800/80 border border-ollo-light-200/50 dark:border-ollo-dark-600/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-ollo-light-300 dark:bg-ollo-dark-700 animate-pulse"></div>
      <div className="space-y-2">
        <div className="w-32 h-4 rounded bg-ollo-light-300 dark:bg-ollo-dark-700 animate-pulse"></div>
        <div className="w-24 h-3 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-4 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
      <div className="w-5/6 h-4 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
      <div className="w-2/3 h-4 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-ollo-light-200 dark:border-ollo-dark-600 flex justify-between">
      <div className="w-20 h-8 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
      <div className="w-20 h-8 rounded bg-ollo-light-200 dark:bg-ollo-dark-600 animate-pulse"></div>
    </div>
  </div>
);

export default HomePage;
