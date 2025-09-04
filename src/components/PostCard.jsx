// ARQUIVO FINAL CORRIGIDO: src/components/PostCard.jsx
// CORREÇÃO: Avatar dos comentários agora busca dados reais do usuário

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import {
  getCommentsForPost,
  addCommentToPost,
  getUserProfile, // NOVA IMPORTAÇÃO
} from '@/services/firestoreService';

// --- Sub-componente: PostHeader ---
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
          <Link to={`/profile/${authorId}`}>
            <Avatar
              src={userAvatar}
              alt={`${userName}'s avatar`}
              className="h-14 w-14 rounded-full object-cover text-gray-400 dark:text-gray-600"
            />
          </Link>
          <div>
            <Link to={`/profile/${authorId}`}>
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

// --- Sub-componente: PostBody ---
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
          className="text-blue-600 font-semibold hover:underline mt-2 text-sm dark:text-blue-400"
        >
          {isExpanded ? 'Mostrar menos' : '...continuar lendo'}
        </button>
      )}
    </div>
  );
});

// --- Sub-componente: CommentItem CORRIGIDO ---
const CommentItem = ({ commentData }) => {
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (!commentData?.authorId && !commentData?.author?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Tenta usar o authorId do comentário, ou o uid do author
        const userId = commentData.authorId || commentData.author?.uid;

        if (userId) {
          const profile = await getUserProfile(userId);
          setAuthorProfile(profile);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do autor do comentário:', error);
        // Se falhar, usa os dados que já temos
        setAuthorProfile({
          name: commentData.author?.displayName || 'Usuário Anônimo',
          avatarURL: commentData.author?.photoURL || null,
          username: commentData.author?.username || 'user',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorProfile();
  }, [commentData]);

  if (loading) {
    return (
      <div className="flex items-start gap-3 mt-3 animate-pulse">
        <div className="h-9 w-9 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl px-3 py-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Determina os dados do autor (prioriza perfil buscado, depois dados do comentário)
  const authorData = {
    uid: commentData.authorId || commentData.author?.uid,
    name:
      authorProfile?.name ||
      commentData.author?.displayName ||
      'Usuário Anônimo',
    avatar: authorProfile?.avatarURL || commentData.author?.photoURL || null,
    username: authorProfile?.username || commentData.author?.username || null,
  };

  return (
    <div className="flex items-start gap-3 mt-3">
      <Link to={`/profile/${authorData.uid}`}>
        <Avatar
          src={authorData.avatar}
          alt={`${authorData.name}'s avatar`}
          className="h-9 w-9"
        />
      </Link>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl px-3 py-2">
        <Link to={`/profile/${authorData.uid}`}>
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:underline">
            {authorData.name}
          </p>
        </Link>
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {commentData.text || commentData.content}
        </p>
        {commentData.createdAt && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(
              commentData.createdAt.toDate?.() || commentData.createdAt
            ).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (ORQUESTRADOR) ---
const PostCard = ({ postData, onDeletePost, isLast }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(() =>
    postData.likes?.includes(currentUser?.uid)
  );

  useEffect(() => {
    const fetchComments = async () => {
      if (!postData.id) return;
      try {
        setCommentsLoading(true);
        console.log('[PostCard] Buscando comentários para post:', postData.id);
        const postComments = await getCommentsForPost(postData.id);
        console.log('[PostCard] Comentários carregados:', postComments);
        setComments(postComments);
      } catch (error) {
        console.error('[PostCard] Erro ao buscar comentários:', error);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [postData.id]);

  useEffect(() => {
    setIsLiked(postData.likes?.includes(currentUser?.uid));
  }, [postData.likes, currentUser]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      console.error('Tentativa de comentar sem um usuário logado.');
      alert(
        'Você precisa estar logado para comentar. Por favor, faça o login novamente.'
      );
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    // CORREÇÃO: Melhora os dados do autor do comentário
    const authorData = {
      uid: currentUser.uid,
      displayName:
        currentUser.displayName || currentUser.name || 'Usuário Anônimo',
      photoURL:
        currentUser.photoURL ||
        currentUser.avatarURL ||
        currentUser.avatarUrl ||
        null,
      username: currentUser.username || null,
    };

    try {
      console.log('[PostCard] Adicionando comentário com dados:', {
        postId: postData.id,
        comment: newComment,
        author: authorData,
      });
      const newCommentData = await addCommentToPost(
        postData.id,
        newComment,
        authorData
      );
      console.log('[PostCard] Comentário adicionado:', newCommentData);
      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('[PostCard] Erro ao adicionar comentário:', error);
      alert('Não foi possível adicionar seu comentário. Tente novamente.');
    }
  };

  const protectedAction = (action) => () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    action();
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    // Aqui você chamaria a função de serviço para dar like/unlike
    // togglePostLike(postData.id, currentUser.uid);
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
        userName={postData.authorName || 'Usuário OLLO'}
        userAvatar={postData.authorAvatar}
        timestamp={postData.createdAt}
        onDelete={protectedAction(() => onDeletePost(postData.id))}
        isOwner={isOwner}
      />

      <Link to={`/posts/${postData.id}`} className="block">
        <PostBody content={postData.content} />
      </Link>

      {postData.media?.[0]?.url && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={postData.media[0].url}
            alt="Conteúdo do post"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

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
              {comments.length || postData.commentsCount || 0}
            </span>
          </Link>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
          <ShareIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
        {currentUser && (
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-start gap-3"
          >
            <Avatar
              src={
                currentUser.photoURL ||
                currentUser.avatarURL ||
                currentUser.avatarUrl
              }
              alt={`${currentUser.displayName || currentUser.name}'s avatar`}
              className="h-9 w-9 mt-1"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-gray-200"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="text-teal-500 font-semibold px-4 py-2 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/50 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              Enviar
            </button>
          </form>
        )}

        <div className="mt-4 space-y-2">
          {commentsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Carregando comentários...
            </p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} commentData={comment} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Seja o primeiro a comentar!
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
