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
  ({ userName, userAvatar, timestamp, onDelete }) => {
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
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {userName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <img
            className="h-14 w-14 rounded-full object-cover"
            src={userAvatar}
            alt={`${userName}'s avatar`}
          />
          <button
            onClick={onDelete}
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
const PostBody = React.memo(({ content }) => {
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

// --- Sub-componente: Ações (Like, Comment, Share) ---
const PostActions = React.memo(
  ({ likes, commentsCount, isLiked, onLike, onShare }) => (
    <div className="mt-4 flex justify-between items-center">
      <div className="flex space-x-6">
        <button
          onClick={onLike}
          className="flex items-center space-x-2 group text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
        >
          {isLiked ? (
            <HeartIconSolid className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6" />
          )}
          <span className="text-sm font-medium">{likes}</span>
        </button>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>
      </div>
      <button
        onClick={onShare}
        className="text-gray-500 dark:text-gray-400 hover:text-ollo-accent-light transition-colors"
      >
        <ShareIcon className="h-6 w-6" />
      </button>
    </div>
  )
);

// --- Sub-componente: Seção de Comentários (com toda a lógica) ---
const CommentsSection = ({ comments, postId, onAddComment, currentUser }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentReactions, setCommentReactions] = useState(() => {
    const initialState = {};
    comments?.forEach((comment) => {
      initialState[comment.id] = {
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        userReaction: null,
      };
    });
    return initialState;
  });

  const handleCommentReaction = useCallback((commentId, reactionType) => {
    /* ...código mantido... */
  }, []);
  const handleCommentSubmit = useCallback(
    (e) => {
      /* ...código mantido... */
    },
    [newCommentText, postId, onAddComment, currentUser]
  );

  // MUDANÇA: Lógica do placeholder dinâmico
  const placeholderText = currentUser
    ? `Comentando como ${currentUser.name}...`
    : 'Faça login para comentar';

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <img
              src={comment.userAvatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
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
                {/* ... botões de like/dislike ... */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="mt-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          // MUDANÇA: Placeholder agora é dinâmico
          placeholder={placeholderText}
          // MUDANÇA: Campo desabilitado se não houver usuário logado
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
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const totalLikes = (postData.likes || 0) + (isLiked ? 1 : 0);

  const handleLikePost = useCallback(() => setIsLiked((prev) => !prev), []);
  const handleShare = useCallback(
    () => alert('Funcionalidade de compartilhar em breve!'),
    []
  );
  const handleDelete = useCallback(() => {
    /* ...código mantido... */
  }, [currentUser, postData, onDeletePost]);

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
      />
      <PostBody content={postData.content} />
      <PostActions
        likes={totalLikes}
        commentsCount={postData.comments?.length || 0}
        isLiked={isLiked}
        onLike={handleLikePost}
        onShare={handleShare}
      />
      <CommentsSection
        comments={postData.comments}
        postId={postData.id}
        onAddComment={onAddComment}
        currentUser={currentUser}
      />
    </article>
  );
};

export default PostCard;
