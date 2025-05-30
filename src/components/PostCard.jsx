// src/components/PostCard.jsx
import { useState, useRef, useEffect } from 'react';
import { 
    HandThumbUpIcon,
    HandThumbDownIcon,
    TrashIcon
} from '@heroicons/react/24/outline'; 
import { 
    HandThumbUpIcon as HandThumbUpSolid,
    HandThumbDownIcon as HandThumbDownSolid
} from '@heroicons/react/24/solid';

function PostCard({ postData, onCommentSubmit, onDeletePost, darkMode, variant }) { 
  if (!postData) { return null; }
  
  const { id: numericId, postId: postIdString, userName, timestamp, content } = postData;
  const currentComments = postData.comments || [];

  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(postData.likeCount || Math.floor(Math.random() * 100));
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null); 
  const NUM_LINES_TO_CLAMP = 4;
  const isTextPotentiallyLong = content && (content.length > 200 || content.split('\n').length > NUM_LINES_TO_CLAMP);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const [commentReactions, setCommentReactions] = useState({});
  const [activeTooltip, setActiveTooltip] = useState('');

  useEffect(() => {
    const initialReactions = {};
    if (currentComments && currentComments.length > 0) {
      currentComments.forEach(comment => {
        const currentCommentId = comment.commentId || `comment-${comment.user}-${Math.random().toString(16).slice(2)}`;
        initialReactions[currentCommentId] = {
          likes: comment.likes || Math.floor(Math.random() * 20), 
          dislikes: comment.dislikes || Math.floor(Math.random() * 5),
          userReaction: comment.userReaction || null, 
        };
      });
    }
    setCommentReactions(initialReactions);
  }, [currentComments]); 

  const handleLikeClick = () => { setIsLiked(!isLiked); setCurrentLikeCount(isLiked ? currentLikeCount - 1 : currentLikeCount + 1); };
  const handleCommentToggle = () => setShowComments(!showComments);
  
  const handleCommentSubmit = () => { 
    if (!newCommentText.trim()) return; 
    onCommentSubmit(postIdString, newCommentText); 
    setNewCommentText(''); 
  };
  const handleShareClick = () => { alert('Compartilhar: Funcionalidade em desenvolvimento!'); };

  const handleCommentReaction = (commentId, reactionType) => {
    setCommentReactions(prevReactions => {
      const currentReactionState = prevReactions[commentId];
      if (!currentReactionState) {
        // console.warn(`Estado de reação não encontrado para commentId: ${commentId}`); // Removido também, mas pode ser útil manter se houver problemas com reações.
        return prevReactions; 
      }
      let newLikes = currentReactionState.likes;
      let newDislikes = currentReactionState.dislikes;
      let newUserReaction = currentReactionState.userReaction;

      if (reactionType === 'like') {
        if (newUserReaction === 'liked') { 
          newLikes--; newUserReaction = null; 
        } else { 
          newLikes++; 
          if (newUserReaction === 'disliked') newDislikes--; 
          newUserReaction = 'liked'; 
        }
      } else if (reactionType === 'dislike') {
        if (newUserReaction === 'disliked') { 
          newDislikes--; newUserReaction = null; 
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
        }
      };
    });
  };

  const handleDeleteClick = () => {
    if (onDeletePost) { 
        onDeletePost(postIdString);
    }
  };

  let cardSpecificStyles = "";
  if (variant === "explore") {
    cardSpecificStyles = "min-h-[400px] flex flex-col"; 
  }
  
  return (
    <div 
      className={`
        bg-white/90 backdrop-blur-md 
        rounded-xl shadow-lg 
        mb-8 
        border border-gray-200/70 
        text-sm sm:text-base 
        ${cardSpecificStyles}
      `}
    >
      <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full"> 
        <div className={`${variant === "explore" ? 'flex-grow' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center min-w-0"> 
                <img 
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full mr-3 sm:mr-3.5 object-cover ring-2 ring-offset-2 ring-offset-white ring-ollo-accent-light/80 flex-shrink-0"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=005A4B&color=A0D2DB&bold=true&size=128`} 
                  alt={`Avatar de ${userName}`} 
                />
                <div className="min-w-0"> 
                  <p className="font-semibold text-sm sm:text-base text-ollo-deep leading-tight truncate">{userName}</p>
                  <p className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">{timestamp}</p>
                </div>
            </div>

            {/* BOTÃO DE EXCLUIR */}
            {userName === "Usuário OLLO" && onDeletePost && (
              <button
                onClick={handleDeleteClick}
                title="Excluir este post"
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-150 ease-in-out ml-2" 
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content e "Continuar lendo" */}
          <div className="mb-2">
            <p 
              ref={contentRef}
              className={`text-gray-700 whitespace-pre-wrap leading-relaxed 
                          ${!isExpanded && isTextPotentiallyLong ? `line-clamp-${NUM_LINES_TO_CLAMP} overflow-hidden` : ''}`}
            >
              {content}
            </p>
            {isTextPotentiallyLong && ( 
              <button 
                onClick={toggleExpand} 
                className="text-ollo-deep hover:text-ollo-accent-light font-semibold text-xs mt-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ollo-deep/50 rounded"
              >
                {isExpanded ? 'Ler menos' : 'Continuar lendo...'}
              </button>
            )}
          </div>
          
          {/* Counts (Likes/Comments) */}
          {(currentLikeCount > 0 || currentComments.length > 0) && (
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500 mt-2 mb-4">
              {currentLikeCount > 0 && ( <span className="hover:text-gray-700 cursor-default">{currentLikeCount} {currentLikeCount === 1 ? 'Gosto' : 'Gostos'}</span> )}
              {currentComments.length > 0 && ( <button onClick={handleCommentToggle} className="hover:text-gray-700">{currentComments.length} {currentComments.length === 1 ? 'Comentário' : 'Comentários'}</button> )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div 
          className={`flex justify-around items-center text-gray-500 border-t border-gray-200/90 pt-3 
                     ${variant === "explore" && !showComments ? 'mt-auto' : 'mt-3'}`} 
        >
          <button onClick={handleLikeClick} className={`group flex items-center space-x-1 rounded hover:bg-gray-100 px-2 sm:px-3 py-1.5 transition-colors duration-150 ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-ollo-deep'}`} title="Gostar">
            <svg 
              className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 group-hover:text-ollo-deep'}`}
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? "0" : "1.5"} stroke={isLiked ? "transparent" : "currentColor"} fill={isLiked ? "currentColor" : "none"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span className="font-medium text-xs hidden md:group-hover:inline ml-1">Gostar</span>
          </button>
          <button onClick={handleCommentToggle} className={`flex items-center space-x-1 rounded hover:bg-gray-100 px-2 sm:px-3 py-1.5 transition-colors duration-150 text-gray-500 hover:text-ollo-deep`} title={showComments ? 'Ocultar comentários' : 'Comentar'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"></path></svg>
            <span className="font-medium text-xs hidden md:inline ml-1">{showComments ? 'Ocultar' : 'Comentar'}</span>
          </button>
          <button onClick={handleShareClick} className={`group flex items-center space-x-1 rounded hover:bg-gray-100 px-2 sm:px-3 py-1.5 transition-colors duration-150 text-gray-500 hover:text-ollo-deep`} title="Partilhar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.317a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
            <span className="font-medium text-xs hidden md:group-hover:inline ml-1">Partilhar</span>
          </button>
        </div>
      </div>

      {/* Seção de Comentários */}
      {showComments && (
        <div className="px-4 sm:px-5 md:px-6 pb-5 pt-4 border-t border-gray-200/90">
          {/* Formulário para novo comentário */}
          <div className="flex items-start space-x-2 sm:space-x-3 mb-4">
            <img className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover flex-shrink-0 ring-1 ring-offset-1 ring-offset-white ring-gray-300" src={`https://ui-avatars.com/api/?name=Eu&background=374151&color=E5E7EB&bold=true&size=96`} alt="Seu avatar para comentar" />
            <div className="flex-1">
              <textarea rows="2" className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:ring-1 focus:ring-ollo-deep focus:border-ollo-deep text-xs sm:text-sm shadow-sm transition-colors" placeholder="Escreva um comentário..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleCommentSubmit} 
                  className="px-4 py-1.5 sm:px-5 sm:py-2 bg-ollo-deep text-ollo-bg-light rounded-lg text-xs font-semibold hover:bg-opacity-90 hover:bg-ollo-deep active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-deep/70 focus:ring-offset-2 focus:ring-offset-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed" 
                  disabled={!newCommentText.trim()}
                >
                  Enviar Comentário 
                </button>
              </div>
            </div>
          </div>
          {/* Lista de Comentários */}
          <div className="space-y-3 sm:space-y-4">
            {currentComments && currentComments.length > 0 ? (
              currentComments.map((comment) => {
                const commentId = comment.commentId || `comment-fallback-${comment.user}-${(comment.text || "").slice(0,10)}-${Math.random().toString(16).slice(2)}`;
                const reactionData = commentReactions[commentId] || { likes: 0, dislikes: 0, userReaction: null };
                const isLikedByUser = reactionData.userReaction === 'liked';
                const isDislikedByUser = reactionData.userReaction === 'disliked';
                const likeTooltipId = `like-tooltip-${commentId}`;
                const dislikeTooltipId = `dislike-tooltip-${commentId}`;
                return (
                  <div key={commentId} className="text-xs sm:text-sm flex items-start space-x-2 sm:space-x-2.5">
                    <img className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-offset-1 ring-offset-white ring-gray-300" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user)}&background=4B5563&color=E5E7EB&size=96`} alt={`Avatar de ${comment.user}`} />
                    <div className="bg-gray-100/90 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 flex-1 shadow-sm border border-gray-200/70"> 
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-semibold text-xs sm:text-sm text-ollo-deep mr-1.5">{comment.user}:</span>
                          <span className="text-gray-700 leading-snug">{comment.text}</span>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center space-x-3 sm:space-x-4">
                        <div className="relative">
                          <button onClick={() => handleCommentReaction(commentId, 'like')} onMouseEnter={() => setActiveTooltip(likeTooltipId)} onMouseLeave={() => setActiveTooltip('')} className={`flex items-center text-xs group ${isLikedByUser ? 'text-ollo-deep' : 'text-gray-500 hover:text-ollo-deep/80'}`}>
                            {isLikedByUser ? <HandThumbUpSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> : <HandThumbUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 group-hover:text-ollo-deep/80" />}
                            <span className={`${isLikedByUser ? 'font-semibold' : ''} text-xs`}>{reactionData.likes}</span>
                          </button>
                          {activeTooltip === likeTooltipId && ( <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black text-gray-100 text-xs font-medium rounded-md shadow-xl z-30 whitespace-nowrap"> Gostei <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></div> </div> )}
                        </div>
                        <div className="relative">
                          <button onClick={() => handleCommentReaction(commentId, 'dislike')} onMouseEnter={() => setActiveTooltip(dislikeTooltipId)} onMouseLeave={() => setActiveTooltip('')} className={`flex items-center text-xs group ${isDislikedByUser ? 'text-red-600' : 'text-gray-500 hover:text-red-500/80'}`}>
                            {isDislikedByUser ? <HandThumbDownSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> : <HandThumbDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 group-hover:text-red-500/80" />}
                            <span className={`${isDislikedByUser ? 'font-semibold' : ''} text-xs`}>{reactionData.dislikes}</span>
                          </button>
                          {activeTooltip === dislikeTooltipId && ( <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black text-gray-100 text-xs font-medium rounded-md shadow-xl z-30 whitespace-nowrap"> Não gostei <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></div> </div> )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-2">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;