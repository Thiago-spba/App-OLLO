// src/components/PostCard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

// --- Sub-componente: Cabeçalho do Post ---
const PostHeader = React.memo(
  ({ userName, userAvatar, timestamp, onDelete, handleProtectedClick }) => {
    const formatTimestamp = (ts) => {
      if (!ts?.toDate) return '';
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
        <div onClick={handleProtectedClick}>
          {' '}
          {/* CLIQUE PROTEGIDO */}
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {userName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <img
            className="h-14 w-14 rounded-full object-cover cursor-pointer" // cursor-pointer para indicar que é clicável
            src={userAvatar}
            alt={`${userName}'s avatar`}
            onClick={handleProtectedClick} // CLIQUE PROTEGIDO
          />
          <button
            onClick={handleProtectedClick(onDelete)} // CLIQUE PROTEGIDO: Passa a função onDelete para ser envolvida
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }
);

// --- Sub-componente: Corpo do Post (com "Continuar Lendo") ---
const PostBody = React.memo(({ content, handleProtectedClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsClamping = content.length > 350;

  return (
    <div className="mt-3" onClick={handleProtectedClick}>
      {' '}
      {/* CLIQUE PROTEGIDO para o corpo do post */}
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
          onClick={handleProtectedClick(() => setIsExpanded((prev) => !prev))} // CLIQUE PROTEGIDO
          className="text-ollo-accent-light font-semibold hover:underline mt-2 text-sm"
        >
          {isExpanded ? 'Mostrar menos' : '...continuar lendo'}
        </button>
      )}
    </div>
  );
});

// --- Sub-componente: Ações (Like, Comment, Share) ---
const PostActions = React.memo(
  ({
    likes,
    commentsCount,
    isLiked,
    onLike,
    onShare,
    handleProtectedClick,
  }) => (
    <div className="mt-4 flex justify-between items-center">
      <div className="flex space-x-6">
        <button
          onClick={handleProtectedClick(onLike)} // CLIQUE PROTEGIDO
          className="flex items-center space-x-2 group text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
        >
          {isLiked ? (
            <HeartIconSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6" />
          )}
          <span className="text-sm font-medium">{likes}</span>
        </button>
        <div // Transformado em div clicável para comentarios
          onClick={handleProtectedClick} // CLIQUE PROTEGIDO para abrir/rolar para comentarios
          className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 cursor-pointer"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>
      </div>
      <button
        onClick={handleProtectedClick(onShare)} // CLIQUE PROTEGIDO
        className="text-gray-500 dark:text-gray-400 hover:text-ollo-accent-light transition-colors"
      >
        <ShareIcon className="h-6 w-6" />
      </button>
    </div>
  )
);

// --- Sub-componente: Seção de Comentários (com toda a lógica) ---
const CommentsSection = ({
  comments,
  postId,
  onAddComment,
  currentUser,
  handleProtectedClick,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentReactions, setCommentReactions] = useState(() => {
    const initialState = {};
    comments?.forEach((comment, index) => {
      // Use index como fallback para id se comment.id não existir
      initialState[comment.id || `mock-comment-${index}`] = {
        // Garantir um ID único para o mock
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        userReaction: null,
      };
    });
    return initialState;
  });

  // <<<<<<<<<< DEFINIÇÃO DA FUNÇÃO handleCommentReaction (CORREÇÃO) <<<<<<<<<<
  const handleCommentReaction = useCallback((commentId, reactionType) => {
    setCommentReactions((prevReactions) => {
      const currentReaction = prevReactions[commentId]?.userReaction;
      const newLikes = prevReactions[commentId]?.likes || 0;
      const newDislikes = prevReactions[commentId]?.dislikes || 0;
      let newUserReaction = null;

      if (reactionType === 'like') {
        if (currentReaction === 'like') {
          // Desfazer like
        } else {
          // Dar like (e desfazer dislike se houver)
          newUserReaction = 'like';
        }
      } else if (reactionType === 'dislike') {
        if (currentReaction === 'dislike') {
          // Desfazer dislike
        } else {
          // Dar dislike (e desfazer like se houver)
          newUserReaction = 'dislike';
        }
      }

      // Lógica simplificada para a vitrine: apenas muda o ícone
      return {
        ...prevReactions,
        [commentId]: {
          ...prevReactions[commentId],
          userReaction: newUserReaction,
        },
      };
    });
  }, []);

  const protectedHandleCommentReaction = useCallback(
    (commentId, reactionType) => {
      return handleProtectedClick(() =>
        handleCommentReaction(commentId, reactionType)
      );
    },
    [handleCommentReaction, handleProtectedClick]
  );

  const protectedHandleCommentSubmit = useCallback(
    (e) => {
      handleProtectedClick(() => {
        if (newCommentText.trim()) {
          onAddComment(postId, newCommentText);
          setNewCommentText('');
        }
      })(e);
    },
    [newCommentText, postId, onAddComment, handleProtectedClick]
  );

  const placeholderText = currentUser
    ? `Comentando como ${currentUser.name}...`
    : 'Faça login para comentar';

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
      <div className="space-y-4">
        {comments?.map(
          (
            comment,
            index // Adicionado index para fallback de key
          ) => (
            <div
              key={comment.id || `comment-${index}`} // Usar comment.id ou um fallback
              className="flex items-start gap-3"
              onClick={handleProtectedClick}
            >
              <img
                src={comment.userAvatar}
                alt=""
                className="h-9 w-9 rounded-full object-cover cursor-pointer"
                onClick={handleProtectedClick}
              />
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800/80 rounded-xl p-3">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-200">
                    {comment.userName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </p>
                </div>
                <div className="flex items-center gap-4 px-2 mt-1">
                  <button
                    onClick={protectedHandleCommentReaction(
                      comment.id || `comment-${index}`,
                      'like'
                    )} // Usar o ID do comentário (ou fallback)
                    className="flex items-center gap-1 text-gray-500 hover:text-green-500 group relative"
                    data-tooltip-id="tooltip-like-comment"
                    data-tooltip-content="Gostar"
                  >
                    {commentReactions[comment.id || `comment-${index}`]
                      ?.userReaction === 'like' ? ( // Usar o ID do comentário (ou fallback)
                      <HandThumbUpIconSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <HandThumbUpIcon className="h-5 w-5" />
                    )}
                    <span className="text-xs">
                      {commentReactions[comment.id || `comment-${index}`]
                        ?.likes || 0}
                    </span>
                  </button>
                  <button
                    onClick={protectedHandleCommentReaction(
                      comment.id || `comment-${index}`, // Usar o ID do comentário (ou fallback)
                      'dislike'
                    )}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 group relative"
                    data-tooltip-id="tooltip-dislike-comment"
                    data-tooltip-content="Não Gostar"
                  >
                    {commentReactions[comment.id || `comment-${index}`]
                      ?.userReaction === 'dislike' ? ( // Usar o ID do comentário (ou fallback)
                      <HandThumbDownIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HandThumbDownIcon className="h-5 w-5" />
                    )}
                    <span className="text-xs">
                      {commentReactions[comment.id || `comment-${index}`]
                        ?.dislikes || 0}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <form
        onSubmit={protectedHandleCommentSubmit}
        className="mt-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={placeholderText}
          disabled={!currentUser}
          className="flex-1 bg-gray-100 dark:bg-gray-800/80 border border-transparent focus:border-ollo-accent-light focus:ring-0 rounded-full py-2 px-4 text-sm disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          className="text-sm font-semibold text-ollo-accent-light hover:text-opacity-80 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={!newCommentText.trim() || !currentUser}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) ---
const PostCard = ({
  postData,
  onAddComment,
  onDeletePost,
  currentUser,
  isLast,
  navigate,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const totalLikes = (postData.likes?.length || 0) + (isLiked ? 1 : 0);

  const handleProtectedClick = useCallback(
    (originalOnClick) => (event) => {
      if (!currentUser) {
        event.preventDefault();
        navigate('/login');
        return;
      }
      if (typeof originalOnClick === 'function') {
        originalOnClick(event);
      }
    },
    [currentUser, navigate]
  );

  const handleLikePost = useCallback(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsLiked((prev) => !prev);
  }, [currentUser, navigate]);

  const handleShare = useCallback(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    alert('Funcionalidade de compartilhar em breve!');
  }, [currentUser, navigate]);

  const handleDelete = useCallback(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      onDeletePost(postData.id);
    }
  }, [currentUser, postData, onDeletePost, navigate]);

  if (!postData) return null;

  return (
    <article
      className={clsx(
        'p-5 transition-colors duration-300',
        !isLast && 'border-b border-gray-200 dark:border-gray-700/60'
      )}
    >
      <PostHeader
        userName={postData.userName}
        userAvatar={postData.userAvatar}
        timestamp={postData.createdAt}
        onDelete={handleDelete}
        handleProtectedClick={handleProtectedClick}
      />
      <PostBody
        content={postData.content}
        handleProtectedClick={handleProtectedClick}
      />
      {postData.imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={postData.imageUrl}
            alt="Conteúdo do post"
            className="w-full h-auto object-cover"
            onClick={handleProtectedClick}
          />
        </div>
      )}
      <PostActions
        likes={totalLikes}
        commentsCount={postData.comments?.length || 0}
        isLiked={isLiked}
        onLike={handleLikePost}
        onShare={handleShare}
        handleProtectedClick={handleProtectedClick}
      />
      <CommentsSection
        comments={postData.comments}
        postId={postData.id}
        onAddComment={onAddComment}
        currentUser={currentUser}
        handleProtectedClick={handleProtectedClick}
      />
    </article>
  );
};

export default PostCard;
