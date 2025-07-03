import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkle,
  ArrowClockwise,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import PostCard from '../components/PostCard';
import StoriesReel from '../components/StoriesReel';
import CreatePostModal from '../components/CreatePostModal';
import StoryModal from '../components/StoryModal';
import CreateStoryModal from '../components/CreateStoryModal';

// Lista inicial mock de stories (troque pelo backend depois se quiser)
const mockStories = [
  {
    id: 1,
    userName: 'Seu Story',
    avatarText: '+',
    isOwn: true,
    imageUrl:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
  },
  {
    id: 2,
    userName: 'Gemini',
    avatarText: 'GA',
    imageUrl:
      'https://images.unsplash.com/photo-1554034483-2610ac3443a5?q=80&w=1887',
  },
  {
    id: 3,
    userName: 'Dev Ent.',
    avatarText: 'DE',
    imageUrl:
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1887',
  },
  {
    id: 4,
    userName: 'Usuário C',
    avatarText: 'UC',
    imageUrl:
      'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2029',
  },
  {
    id: 5,
    userName: 'Usuário D',
    avatarText: 'UD',
    imageUrl:
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=1887',
  },
  {
    id: 6,
    userName: 'Usuário E',
    avatarText: 'UE',
    imageUrl:
      'https://images.unsplash.com/photo-1579546929662-7221826a7f8c?q=80&w=2070',
  },
];

const HomePage = ({ onCommentSubmit, onDeletePost }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Controle de posts
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Controle dos stories
  const [stories, setStories] = useState(mockStories);

  // Modal para criar story (botão "+")
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Modal para visualizar stories
  const [modalIndex, setModalIndex] = useState(null);

  // Carregar posts do localStorage
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const savedPosts = JSON.parse(localStorage.getItem('ollo-posts')) || [];
        setPosts(savedPosts);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Salvar posts no localStorage ao mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('ollo-posts', JSON.stringify(posts));
    }, 500);
    return () => clearTimeout(timer);
  }, [posts]);

  // Handler para novo post (apenas logado)
  const handleNewPost = (newPost) => {
    setPosts((prev) => [
      {
        ...newPost,
        user: {
          name: currentUser?.name || 'Usuário OLLO',
          avatar: currentUser?.avatarUrl || '/images/default-avatar.png',
        },
      },
      ...prev,
    ]);
    setIsModalOpen(false);
  };

  // Handler para abrir modal de criação (exige login)
  const handleOpenModal = () => {
    if (!currentUser) {
      navigate('/login', {
        state: { message: 'Faça login para compartilhar ou comentar!' },
      });
      return;
    }
    setIsModalOpen(true);
  };

  // Handler de tentar comentar (exemplo: pode ser passado ao PostCard)
  const handleCommentAttempt = () => {
    if (!currentUser) {
      navigate('/login', { state: { message: 'Faça login para comentar!' } });
      return false;
    }
    return true;
  };

  // === FUNÇÕES DE NAVEGAÇÃO DE STORY VISUALIZAÇÃO ===
  const openStoryModal = (story) => {
    const index = stories.findIndex((s) => s.id === story.id);
    setModalIndex(index);
  };
  const closeStoryModal = () => setModalIndex(null);
  const goToPrevStory = () => {
    setModalIndex((idx) => (idx > 0 ? idx - 1 : idx));
  };
  const goToNextStory = () => {
    setModalIndex((idx) => (idx < stories.length - 1 ? idx + 1 : idx));
  };

  // === FUNÇÕES DO MODAL DE CRIAR STORY (+) ===
  const handleOpenCreateStory = () => setIsStoryModalOpen(true);
  const handleCloseCreateStory = () => setIsStoryModalOpen(false);

  // Atualiza stories ao criar um novo (você pode buscar do Firebase aqui no futuro)
  const handleStoryCreated = () => {
    setIsStoryModalOpen(false);
    // Exemplo: buscar de novo os stories do backend e atualizar:
    // fetchStoriesFromFirebase().then(setStories);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-x-6 xl:gap-x-8 pt-1 px-4 sm:px-6 lg:px-8">
      <main className="w-full flex-grow lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0">
        <div className="space-y-6 md:space-y-8">
          {/* Barra de Stories */}
          <StoriesReel
            stories={stories}
            onStoryClick={openStoryModal}
            onCreateStoryClick={handleOpenCreateStory}
          />

          {/* Modal de visualização de Story */}
          {modalIndex !== null && (
            <StoryModal
              imageUrl={stories[modalIndex].imageUrl}
              userName={stories[modalIndex].userName}
              avatarText={stories[modalIndex].avatarText}
              onClose={closeStoryModal}
              onPrev={goToPrevStory}
              onNext={goToNextStory}
              disablePrev={modalIndex === 0}
              disableNext={modalIndex === stories.length - 1}
            />
          )}

          {/* Modal de criar Story (botão "+") */}
          {isStoryModalOpen && (
            <CreateStoryModal
              onClose={handleCloseCreateStory}
              onStoryCreated={handleCloseCreateStory}
            />
          )}

          {/* Bloco de criar post */}
          <section className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-lg border border-gray-200/70 dark:border-gray-700/50 transition-all hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-ollo-primary-400 dark:border-ollo-accent-light">
                <img
                  src={
                    currentUser?.avatar ||
                    currentUser?.avatarUrl ||
                    '/images/default-avatar.png'
                  }
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
                className="flex-grow px-5 py-3 rounded-xl text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors border border-gray-300 dark:border-gray-600"
                style={{ minHeight: 48 }}
              >
                <span className="font-medium">
                  {currentUser
                    ? `No que você está pensando, ${currentUser.name.split(' ')[0]}?`
                    : 'Faça login para compartilhar algo!'}
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
                className="flex items-center gap-2 px-4 py-2 text-ollo-accent dark:text-ollo-accent-light hover:bg-ollo-accent-50 dark:hover:bg-ollo-dark-700 rounded-lg transition-colors"
              >
                <Sparkle size={20} weight="duotone" />
                <span>Momento</span>
              </button>
            </div>
          </section>

          {/* Feed de posts */}
          <section aria-labelledby="feed-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-ollo-dark-900 dark:text-ollo-light-100">
                Atualizações Recentes
              </h2>
              <button className="text-ollo-primary-500 hover:text-ollo-primary-600 dark:text-ollo-primary-400 dark:hover:text-ollo-primary-300 transition-colors">
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
                    onCommentSubmit={(commentData) => {
                      // Se não estiver logado, não deixa comentar
                      if (!handleCommentAttempt()) return;
                      if (onCommentSubmit) onCommentSubmit(commentData);
                    }}
                    onDeletePost={onDeletePost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-md border border-gray-200/70 dark:border-gray-700/50">
                <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle
                    size={48}
                    className="text-ollo-primary-500 dark:text-ollo-primary-400"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                  Bem-vindo ao OLLO!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
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
            {/* Pode adicionar aqui banners, avisos ou CTAs */}
          </div>
        </div>
      </aside>

      {/* Modal de criar post (só aparece se logado) */}
      {isModalOpen && currentUser && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleNewPost}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// Skeleton de carregamento para feed
const PostCardSkeleton = () => (
  <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="space-y-2">
        <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="w-24 h-3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
      <div className="w-5/6 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
      <div className="w-2/3 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
      <div className="w-20 h-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
      <div className="w-20 h-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    </div>
  </div>
);

export default HomePage;
