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

// --- DADOS DE EXEMPLO PARA A VITRINE (AJUSTADO: Comentário removido do mock-1 e URL da imagem externa substituída) ---
const mockPosts = [
  {
    id: 'mock-1',
    userName: 'Explorador Ollo',
    userAvatar: '/images/default-avatar.png',
    content:
      'Descubra o mundo com OLLO! Conecte-se e compartilhe suas ideias com nossa comunidade. Clique para saber mais!',
    imageUrl: '/images/mock-post-image.jpg', // <<<<<<<<<< MODIFICADA AQUI: Usando imagem local (certifique-se de ter esta imagem em public/images) <<<<<<<<<<
    createdAt: new Timestamp(Date.now() / 1000 - 3600, 0), // 1 hora atrás
    likes: ['anon1', 'anon2', 'anon3'],
    comments: [], // AGORA ESTÁ VAZIO
  },
  {
    id: 'mock-2',
    userName: 'Comunidade Ollo',
    userAvatar: '/images/default-avatar.png',
    content:
      'Seja bem-vindo(a)! Crie seu perfil, faça sua primeira publicação e comece a seguir pessoas que te inspiram. O Ollo te espera!',
    imageUrl: '', // Sem imagem para este post
    createdAt: new Timestamp(Date.now() / 1000 - 7200, 0), // 2 horas atrás
    likes: ['anon4', 'anon5'],
    comments: [],
  },
  // Adicione mais posts de exemplo se desejar
];

// --- Componentes Internos da Página ---
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

// <<<<<<<<<< MODIFICADA AQUI: ADICIONADA 'navigate' nas props de FeedSection e PostCard <<<<<<<<<<
const FeedSection = ({
  posts,
  isLoading,
  onAddComment,
  onDeletePost,
  navigate, // ADICIONADA AQUI
}) => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();

  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-400">Carregando OLLOs...</div>
    );
  }
  return (
    <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl border border-gray-200 dark:border-gray-700/60">
      {posts && posts.length > 0 ? (
        posts.map((post, index) => (
          <PostCard
            key={post.id}
            postData={post}
            onAddComment={onAddComment}
            onDeletePost={onDeletePost}
            darkMode={darkMode}
            currentUser={currentUser}
            isLast={index === posts.length - 1}
            navigate={navigate} // ADICIONADA AQUI
          />
        ))
      ) : (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          Não há OLLOs para exibir no momento.
        </div>
      )}
    </div>
  );
};

// <<<<<<<<<< MODIFICADA AQUI: ADICIONADA 'navigate' nas props de RightSidebar e proteções de clique <<<<<<<<<<
const RightSidebar = ({ navigate }) => {
  // ADICIONADA AQUI
  // Função utilitária para proteger cliques, similar à do PostCard
  const handleProtectedClick = useCallback(
    (event) => {
      event.preventDefault(); // Impede o comportamento padrão do link
      navigate('/login');
    },
    [navigate]
  );

  return (
    <aside className="hidden lg:block space-y-6">
      {/* Exemplo de Conteúdo da Sidebar Direita */}
      <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">
          Quem seguir
        </h3>
        <ul className="space-y-3">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-ollo-deep dark:hover:text-ollo-accent-light transition-colors"
              onClick={handleProtectedClick} // NOVA AQUI
            >
              <img
                src="/images/default-avatar.png" // MODIFICADA AQUI: Corrigindo URL
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">Usuário Teste 1</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-ollo-deep dark:hover:text-ollo-accent-light transition-colors"
              onClick={handleProtectedClick} // NOVA AQUI
            >
              <img
                src="/images/default-avatar.png" // MODIFICADA AQUI: Corrigindo URL
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">Usuário Teste 2</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="bg-white dark:bg-ollo-deep/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/60">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">
          Assuntos do momento
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            <a
              href="#"
              className="hover:text-ollo-deep dark:hover:text-ollo-accent-light transition-colors"
              onClick={handleProtectedClick} // NOVA AQUI
            >
              #Tecnologia
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:text-ollo-deep dark:hover:text-ollo-accent-light transition-colors"
              onClick={handleProtectedClick} // NOVA AQUI
            >
              #InteligenciaArtificial
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:text-ollo-deep dark:hover:text-ollo-accent-light transition-colors"
              onClick={handleProtectedClick} // NOVA AQUI
            >
              #Natureza
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
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

  // Inicializa posts com mockPosts para a vitrine
  const [posts, setPosts] = useState(mockPosts);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stories, setStories] = useState(mockStories);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);

  // Lógica de carregamento de posts robusta
  useEffect(() => {
    if (currentUser) {
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
          setPosts(postsData.length > 0 ? postsData : mockPosts);
          setPostsLoading(false);
        },
        (error) => {
          console.error(
            'Erro ao buscar posts (perm_denied pode ser esperado se não logado):',
            error
          );
          setPosts(mockPosts);
          setPostsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setPosts(mockPosts);
      setPostsLoading(false);
    }
  }, [currentUser]);

  // Handlers
  const handleCommentSubmit = useCallback(
    async (postId, commentText) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      try {
        const postRef = doc(db, 'posts', postId);
        const newComment = {
          userId: currentUser.uid,
          userName: currentUser.name,
          userAvatar: currentUser.avatarUrl || '/images/default-avatar.png',
          content: commentText,
          createdAt: Timestamp.now(),
        };
        await updateDoc(postRef, {
          comments: arrayUnion(newComment),
        });
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
      }
    },
    [currentUser, navigate]
  );
  const handleDeletePost = useCallback(
    async (postId) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error('Erro ao deletar post:', error);
      }
    },
    [currentUser, navigate]
  );
  const handleNewPost = () => setIsModalOpen(false);
  const handleOpenModal = () => {
    if (currentUser) setIsModalOpen(true);
    else navigate('/login');
  };
  const handleStoryClick = (story) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setCurrentStory(story);
  };
  const handleCloseStoryModal = () => setCurrentStory(null);
  const handleOpenCreateStory = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsStoryModalOpen(true);
  };
  const handleCloseCreateStory = () => setIsStoryModalOpen(false);

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

          <FeedSection
            posts={posts}
            isLoading={postsLoading}
            onAddComment={handleCommentSubmit}
            onDeletePost={handleDeletePost}
            navigate={navigate}
          />
        </main>
        {/* <<<<<<<<<< MODIFICADA AQUI: Passando 'navigate' para RightSidebar <<<<<<<<<< */}
        <RightSidebar navigate={navigate} />
      </div>

      {/* Modais */}
      {isModalOpen && currentUser && (
        <CreatePostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleNewPost}
          currentUser={currentUser}
        />
      )}
      {currentStory && currentUser && (
        <StoryModal story={currentStory} onClose={handleCloseStoryModal} />
      )}
      {isStoryModalOpen && currentUser && (
        <CreateStoryModal onClose={handleCloseCreateStory} />
      )}
    </div>
  );
};

export default HomePage;
