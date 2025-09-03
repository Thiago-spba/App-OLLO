// ARQUIVO: src/components/PostCard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // MUDANÇA: Importando Link para navegação
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext'; // MUDANÇA: useAuth para verificações

// --- Sub-componente: Cabeçalho do Post ---
const PostHeader = React.memo(
  ({ authorId, userName, userAvatar, timestamp, onDelete, isOwner }) => {
    const formatTimestamp = (ts) => {
      if (!ts?.toDate) return 'agora mesmo';
      const now = new Date();
      const postDate = ts.toDate();
      const seconds = Math.floor((now - postDate) / 1000);
      if (seconds < 60) return 'agora mesmo';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days}d`;
    };

    return (
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${userName}`}>
            <Avatar
              src={userAvatar}
              alt={`${userName}'s avatar`}
              className="h-14 w-14 rounded-full object-cover text-gray-400 dark:text-gray-600"
            />
          </Link>
          <div>
            <Link to={`/profile/${userName}`}>
              <p className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
                {userName}
              </p>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTimestamp(timestamp)}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    );
  }
);

// --- Sub-componente: Corpo do Post ---
const PostBody = React.memo(({ content }) => {
  // CORREÇÃO: Removido handleProtectedClick daqui. A navegação será no PostCard.
  const [isExpanded, setIsExpanded] = useState(false);
  const needsClamping = content.length > 350;

  return (
    <div className="mt-3">
      <p
        className={clsx(
          'text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap',
          !isExpanded && needsClamping && 'line-clamp-6'
        )}
      >
        {content}
      </p>
      {needsClamping && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-ollo-accent-light font-semibold hover:underline mt-2 text-sm"
        >
          {isExpanded ? 'Mostrar menos' : '...continuar lendo'}
        </button>
      )}
    </div>
  );
});

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) ---
const PostCard = ({ postData, onAddComment, onDeletePost, isLast }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // MELHORIA: O estado de 'curtido' agora vem diretamente dos dados do post.
  const [isLiked, setIsLiked] = useState(() =>
    postData.likes?.includes(currentUser?.uid)
  );

  // Recalcula o estado se o post ou o usuário mudar.
  useEffect(() => {
    setIsLiked(postData.likes?.includes(currentUser?.uid));
  }, [postData.likes, currentUser]);

  // Ação protegida: só executa a função se o usuário estiver logado.
  const protectedAction = (action) => () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    action();
  };

  const handleToggleLike = () => {
    // Aqui virá a chamada para o firestoreService.togglePostLike(postId, currentUser.uid)
    // Por enquanto, apenas atualizamos a UI de forma otimista.
    setIsLiked((prev) => !prev);
  };

  const isOwner = currentUser?.uid === postData.authorId;

  if (!postData) return null;

  return (
    <article
      className={clsx(
        'p-5 transition-colors duration-300',
        !isLast && 'border-b border-gray-200 dark:border-gray-700/60'
      )}
    >
      <PostHeader
        authorId={postData.authorId}
        userName={postData.authorName} // CORREÇÃO: Usando os campos padronizados
        userAvatar={postData.authorAvatar} // CORREÇÃO: Usando os campos padronizados
        timestamp={postData.createdAt}
        onDelete={protectedAction(() => onDeletePost(postData.id))}
        isOwner={isOwner}
      />

      <Link to={`/posts/${postData.id}`} className="block">
        <PostBody content={postData.content} />
      </Link>

      {postData.media && postData.media.length > 0 && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={postData.media[0].url}
            alt="Conteúdo do post"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* PostActions e CommentsSection podem ser integrados aqui no futuro */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-6">
          <button
            onClick={protectedAction(handleToggleLike)}
            className="flex items-center space-x-2 group text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
          >
            {isLiked ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">
              {postData.likes?.length || 0}
            </span>
          </button>
          <Link
            to={`/posts/${postData.id}#comments`}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
            <span className="text-sm font-medium">
              {postData.commentsCount || 0}
            </span>
          </Link>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-ollo-accent-light transition-colors">
          <ShareIcon className="h-6 w-6" />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
