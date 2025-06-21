import { useState, useRef, useEffect } from 'react';
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

// Função para formatar timestamp Firestore/ISO/string para string legível
function formatDate(ts) {
  if (!ts) return '';
  if (typeof ts === 'object' && ts.seconds) {
    // Firestore Timestamp
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  if (typeof ts === 'string') {
    return new Date(ts).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  return '';
}

function PostCard({ postData, onCommentSubmit, onDeletePost, variant }) {
  if (!postData) return null;

  // Corrigido para o modelo OLLO: userName e userAvatar
  const {
    postId: postIdString,
    userName,
    userAvatar,
    timestamp,
    content,
    media = [],
    comments = [],
    likes = [],
  } = postData;

  const currentComments = comments;

  // Estados internos
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(
    Array.isArray(likes) ? likes.length : 0
  );
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentReactions, setCommentReactions] = useState({});
  const [activeTooltip, setActiveTooltip] = useState('');

  const contentRef = useRef(null);
  const NUM_LINES_TO_CLAMP = 4;
  const isTextPotentiallyLong =
    content &&
    (content.length > 200 || content.split('\n').length > NUM_LINES_TO_CLAMP);

  // Reações dos comentários
  useEffect(() => {
    const initialReactions = {};
    if (currentComments.length > 0) {
      currentComments.forEach((comment) => {
        const commentId = comment.commentId || `c-${Math.random()}`;
        initialReactions[commentId] = {
          likes: comment.likes || Math.floor(Math.random() * 20),
          dislikes: comment.dislikes || Math.floor(Math.random() * 5),
          userReaction: comment.userReaction || null,
        };
      });
    }
    setCommentReactions(initialReactions);
  }, [currentComments]);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setCurrentLikeCount(isLiked ? currentLikeCount - 1 : currentLikeCount + 1);
  };
  const handleCommentToggle = () => setShowComments(!showComments);
  const handleCommentSubmit = () => {
    if (newCommentText.trim()) {
      onCommentSubmit && onCommentSubmit(postIdString, newCommentText);
      setNewCommentText('');
    }
  };
  const handleShareClick = () => {
    alert('Compartilhar: Funcionalidade em desenvolvimento!');
  };
  const handleDeleteClick = () => {
    if (onDeletePost) {
      onDeletePost(postIdString);
    }
  };

  const handleCommentReaction = (commentId, reactionType) => {
    setCommentReactions((prevReactions) => {
      const current = prevReactions[commentId];
      if (!current) return prevReactions;

      let newLikes = current.likes;
      let newDislikes = current.dislikes;
      let newUserReaction = current.userReaction;

      if (reactionType === 'like') {
        if (newUserReaction === 'liked') {
          newLikes--;
          newUserReaction = null;
        } else {
          newLikes++;
          if (newUserReaction === 'disliked') newDislikes--;
          newUserReaction = 'liked';
        }
      } else if (reactionType === 'dislike') {
        if (newUserReaction === 'disliked') {
          newDislikes--;
          newUserReaction = null;
        } else {
          newDislikes++;
          if (newUserReaction === 'liked') newLikes--;
          newUserReaction = 'disliked';
        }
      }

      return {
        ...prevReactions,
        [commentId]: {
          likes: Math.max(0, newLikes),
          dislikes: Math.max(0, newDislikes),
          userReaction: newUserReaction,
        },
      };
    });
  };

  // Avatar: preferencialmente do userAvatar do banco
  const getAvatarUrl = () => {
    if (userAvatar && userAvatar !== '/images/default-avatar.png')
      return userAvatar;
    // Se não houver, usa avatar automático:
    const isDarkMode = document.documentElement.classList.contains('dark');
    const bgColor = isDarkMode ? '00A896' : '0D1B2A';
    const textColor = isDarkMode ? '0D1B2A' : 'E0E1DD';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'OLLO')}&background=${bgColor}&color=${textColor}&bold=true&size=128`;
  };
    return (
    <div
      className={`
        bg-white/90 dark:bg-ollo-slate/90 
        backdrop-blur-md rounded-xl shadow-lg mb-8 
        border border-gray-200/70 dark:border-gray-700/50 
        text-sm sm:text-base
        ${variant === 'explore' ? 'min-h-[400px] flex flex-col' : ''}
      `}
    >
      <div
        className={`p-4 sm:p-5 md:p-6 flex flex-col h-full ${variant === 'explore' ? 'flex-grow' : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0">
            <img
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full mr-3 sm:mr-3.5 object-cover ring-2 ring-offset-2 ring-ollo-accent-light/80 dark:ring-ollo-accent-light ring-offset-white dark:ring-offset-ollo-slate"
              src={getAvatarUrl()}
              alt={`Avatar de ${userName}`}
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base text-ollo-deep dark:text-ollo-light leading-tight truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors">
                {formatDate(timestamp)}
              </p>
            </div>
          </div>
          {/* Excluir disponível só para autor, se quiser: */}
          {userName === 'Usuário OLLO' && onDeletePost && (
            <button
              onClick={handleDeleteClick}
              title="Excluir este post"
              className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-150 ease-in-out ml-2"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-2">
          <p
            ref={contentRef}
            className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed ${!isExpanded && isTextPotentiallyLong ? `line-clamp-${NUM_LINES_TO_CLAMP}` : ''}`}
          >
            {content}
          </p>
          {isTextPotentiallyLong && (
            <button
              onClick={toggleExpand}
              className="text-ollo-deep dark:text-ollo-accent-light hover:underline font-semibold text-xs mt-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ollo-deep/50 dark:focus:ring-ollo-accent-light/50 rounded"
            >
              {isExpanded ? 'Ler menos' : 'Continuar lendo...'}
            </button>
          )}
        </div>

        {/* Exibir imagens/vídeos do post */}
        {media.length > 0 && (
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {media.map((m, idx) =>
              m.type === 'video' ? (
                <video
                  key={idx}
                  src={m.url}
                  controls
                  className="w-full max-h-[320px] rounded-lg object-contain"
                />
              ) : (
                <img
                  key={idx}
                  src={m.url}
                  alt="Mídia do post"
                  className="w-full max-h-[320px] rounded-lg object-contain"
                />
              )
            )}
          </div>
        )}

        {(currentLikeCount > 0 || currentComments.length > 0) && (
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
            {currentLikeCount > 0 && (
              <span className="hover:text-gray-700 dark:hover:text-gray-200 cursor-default">
                {currentLikeCount} {currentLikeCount === 1 ? 'Gosto' : 'Gostos'}
              </span>
            )}
            {currentComments.length > 0 && (
              <button
                onClick={handleCommentToggle}
                className="hover:text-gray-700 dark:hover:text-gray-200"
              >
                {currentComments.length}{' '}
                {currentComments.length === 1 ? 'Comentário' : 'Comentários'}
              </button>
            )}
          </div>
        )}

        <div
          className={`flex justify-around items-center border-t border-gray-200/90 dark:border-gray-700/50 pt-3 ${variant === 'explore' && !showComments ? 'mt-auto' : 'mt-3'}`}
        >
          <button
            onClick={handleLikeClick}
            className={`group flex items-center space-x-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 px-2 sm:px-3 py-1.5 transition-colors duration-150 ${isLiked ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-ollo-deep dark:hover:text-gray-200'}`}
            title="Gostar"
          >
            {isLiked ? (
              <HeartSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="font-medium text-xs hidden md:group-hover:inline ml-1">
              Gostar
            </span>
          </button>
          <button
            onClick={handleCommentToggle}
            className="group flex items-center space-x-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 px-2 sm:px-3 py-1.5 transition-colors duration-150 text-gray-500 dark:text-gray-400 hover:text-ollo-deep dark:hover:text-gray-200"
            title={showComments ? 'Ocultar comentários' : 'Comentar'}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium text-xs hidden md:inline ml-1">
              {showComments ? 'Ocultar' : 'Comentar'}
            </span>
          </button>
          <button
            onClick={handleShareClick}
            className="group flex items-center space-x-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 px-2 sm:px-3 py-1.5 transition-colors duration-150 text-gray-500 dark:text-gray-400 hover:text-ollo-deep dark:hover:text-gray-200"
            title="Partilhar"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="font-medium text-xs hidden md:group-hover:inline ml-1">
              Partilhar
            </span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="px-4 sm:px-5 md:px-6 pb-5 pt-4 border-t border-gray-200/90 dark:border-gray-700/50">
          <div className="flex items-start space-x-2 sm:space-x-3 mb-4">
            <img
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover flex-shrink-0 ring-1 ring-offset-1 ring-gray-300 dark:ring-gray-600 ring-offset-white dark:ring-offset-ollo-slate"
              src={getAvatarUrl()}
              alt="Seu avatar"
            />
            <div className="flex-1">
              <textarea
                rows="2"
                className="w-full p-2 sm:p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light focus:border-transparent text-xs sm:text-sm shadow-sm transition-colors"
                placeholder="Escreva um comentário..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCommentSubmit}
                  className="px-4 py-1.5 sm:px-5 sm:py-2 bg-ollo-deep text-ollo-light dark:bg-ollo-accent-light dark:text-ollo-deep rounded-lg text-xs font-semibold hover:bg-opacity-90 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:ring-ollo-deep/70 dark:focus:ring-ollo-accent-light/70 focus:ring-offset-white dark:focus:ring-offset-ollo-slate"
                  disabled={!newCommentText.trim()}
                >
                  Enviar Comentário
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {currentComments.length > 0 ? (
              currentComments.map((comment) => {
                const commentId = comment.commentId || `c-${Math.random()}`;
                const reactionData = commentReactions[commentId] || {
                  likes: 0,
                  dislikes: 0,
                  userReaction: null,
                };
                const isLikedByUser = reactionData.userReaction === 'liked';
                const isDislikedByUser =
                  reactionData.userReaction === 'disliked';
                return (
                  <div
                    key={commentId}
                    className="text-xs sm:text-sm flex items-start space-x-2 sm:space-2.5"
                  >
                    <img
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-offset-1 ring-gray-300 dark:ring-gray-600 ring-offset-white dark:ring-offset-ollo-slate"
                      src={getAvatarUrl()}
                      alt={`Avatar de ${comment.user}`}
                    />
                    <div className="bg-gray-100/90 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 flex-1 shadow-sm border border-gray-200/70 dark:border-gray-700/50">
                      <p className="text-gray-700 dark:text-gray-300 leading-snug">
                        <span className="font-semibold text-ollo-deep dark:text-ollo-light mr-1.5">
                          {comment.user}:
                        </span>
                        {comment.text}
                      </p>
                      <div className="mt-1.5 flex items-center space-x-3 sm:space-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              handleCommentReaction(commentId, 'like')
                            }
                            onMouseEnter={() =>
                              setActiveTooltip(`like-${commentId}`)
                            }
                            onMouseLeave={() => setActiveTooltip('')}
                            className={`flex items-center text-xs group ${isLikedByUser ? 'text-ollo-deep dark:text-ollo-accent-light' : 'text-gray-500 dark:text-gray-400 hover:text-ollo-deep dark:hover:text-ollo-accent-light/80'}`}
                          >
                            {isLikedByUser ? (
                              <HandThumbUpSolid className="h-4 w-4 mr-1" />
                            ) : (
                              <HandThumbUpIcon className="h-4 w-4 mr-1" />
                            )}
                            <span
                              className={`${isLikedByUser ? 'font-semibold' : ''}`}
                            >
                              {reactionData.likes}
                            </span>
                          </button>
                          {activeTooltip === `like-${commentId}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md shadow-xl z-30">
                              {' '}
                              Gostei{' '}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            onClick={() =>
                              handleCommentReaction(commentId, 'dislike')
                            }
                            onMouseEnter={() =>
                              setActiveTooltip(`dislike-${commentId}`)
                            }
                            onMouseLeave={() => setActiveTooltip('')}
                            className={`flex items-center text-xs group ${isDislikedByUser ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500'}`}
                          >
                            {isDislikedByUser ? (
                              <HandThumbDownSolid className="h-4 w-4 mr-1" />
                            ) : (
                              <HandThumbDownIcon className="h-4 w-4 mr-1" />
                            )}
                            <span
                              className={`${isDislikedByUser ? 'font-semibold' : ''}`}
                            >
                              {reactionData.dislikes}
                            </span>
                          </button>
                          {activeTooltip === `dislike-${commentId}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md shadow-xl z-30">
                              {' '}
                              Não gostei{' '}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
