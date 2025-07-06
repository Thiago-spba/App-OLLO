// src/components/PostCard.jsx — Versão OLLO com correção de contraste
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid';

function PostCard({ postData, onCommentSubmit, onDeletePost, variant }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!postData) return null;

  const {
    postId,
    userName,
    timestamp,
    content,
    comments = [],
    likeCount = 0,
  } = postData;

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reactions, setReactions] = useState({});
  const [expanded, setExpanded] = useState(false);

  const MAX_LINES = 4;
  const isLongText =
    content && (content.length > 200 || content.split('\n').length > MAX_LINES);

  useEffect(() => {
    const initial = {};
    comments.forEach((c) => {
      const id = c.commentId || Math.random().toString();
      initial[id] = {
        likes: c.likes || 0,
        dislikes: c.dislikes || 0,
        userReaction: c.userReaction || null,
      };
    });
    setReactions(initial);
  }, [comments]);

  const requireLogin =
    (fn) =>
    (...args) => {
      if (!currentUser) {
        navigate('/login', {
          state: { message: 'Faça login para interagir!' },
        });
        return;
      }
      fn(...args);
    };

  const getAvatarUrl = (name) => {
    const dark = document.documentElement.classList.contains('dark');
    const bg = dark ? '00A896' : '0D1B2A';
    const color = dark ? '0D1B2A' : 'E0E1DD';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${bg}&color=${color}&bold=true&size=128`;
  };

  const handleLike = requireLogin(() => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  });

  const handleCommentSubmit = requireLogin(() => {
    if (commentText.trim() && onCommentSubmit) {
      onCommentSubmit(postId, commentText.trim());
      setCommentText('');
    }
  });

  const handleReaction = requireLogin((commentId, type) => {
    setReactions((prev) => {
      const c = prev[commentId];
      if (!c) return prev;

      let { likes, dislikes, userReaction } = c;
      if (type === 'like') {
        if (userReaction === 'liked') {
          likes--;
          userReaction = null;
        } else {
          likes++;
          if (userReaction === 'disliked') dislikes--;
          userReaction = 'liked';
        }
      } else {
        if (userReaction === 'disliked') {
          dislikes--;
          userReaction = null;
        } else {
          dislikes++;
          if (userReaction === 'liked') likes--;
          userReaction = 'disliked';
        }
      }

      return {
        ...prev,
        [commentId]: {
          likes: Math.max(0, likes),
          dislikes: Math.max(0, dislikes),
          userReaction,
        },
      };
    });
  });

  const handleDelete = requireLogin(() => {
    if (onDeletePost) onDeletePost(postId);
  });

  const handleShare = requireLogin(() => {
    alert('Funcionalidade de compartilhamento ainda será implementada.');
  });

  return (
    <div className="rounded-xl shadow-md bg-gray-100 dark:bg-gray-800 border border-gray-300/40 dark:border-gray-700/40 mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl(userName)}
              alt="Avatar"
              className="h-11 w-11 rounded-full border-2 border-ollo-primary-500"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div>
              <p className="font-semibold text-ollo-deep dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-gray-500">{timestamp}</p>
            </div>
          </div>
          {userName === 'Usuário OLLO' && onDeletePost && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-400"
              title="Excluir post"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
          {expanded
            ? content
            : content.split('\n').slice(0, MAX_LINES).join('\n')}
          {isLongText && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="block text-sm mt-2 text-ollo-deep dark:text-ollo-accent-light hover:underline"
            >
              {expanded ? 'Ler menos' : 'Continuar lendo...'}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 border-gray-300 dark:border-gray-700 text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-red-500 hover:opacity-80"
            >
              {isLiked ? (
                <HeartSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              {likes}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-600 dark:text-gray-400"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              {comments.length > 0 && (
                <span className="ml-1">{comments.length}</span>
              )}
            </button>
          </div>
          <button
            onClick={handleShare}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <textarea
            rows={2}
            placeholder="Escreva um comentário..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!commentText.trim()}
            className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-deep/70 dark:focus:ring-ollo-accent-light/70 focus:ring-offset-white dark:focus:ring-offset-gray-900 
              ${
                commentText.trim()
                  ? 'bg-ollo-deep dark:bg-ollo-accent-light text-white dark:text-gray-900 hover:opacity-90'
                  : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            Enviar
          </button>

          <div className="mt-4 space-y-4">
            {comments.map((c, i) => {
              const commentId = c.commentId || `c-${i}`;
              const reaction = reactions[commentId] || {
                likes: 0,
                dislikes: 0,
              };
              return (
                <div key={commentId} className="flex items-start gap-3">
                  <img
                    src={getAvatarUrl(c.user)}
                    alt="avatar"
                    className="h-8 w-8 rounded-full border"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-bold mr-2">{c.user}</span>
                      {c.text}
                    </p>
                    <div className="flex gap-4 text-xs mt-1 text-gray-500 dark:text-gray-400">
                      <button onClick={() => handleReaction(commentId, 'like')}>
                        👍 {reaction.likes}
                      </button>
                      <button
                        onClick={() => handleReaction(commentId, 'dislike')}
                      >
                        👎 {reaction.dislikes}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <p className="text-center text-sm text-gray-400 italic">
                Nenhum comentário ainda.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
