// src/components/StoriesReel.jsx

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
// Firebase imports
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const colors = {
  bg: 'bg-gray-100 dark:bg-gray-900',
  border: 'border-gray-300 dark:border-gray-600',
  text: 'text-gray-700 dark:text-gray-300',
  hoverText: 'hover:text-gray-900 dark:hover:text-white',
  createBtn: {
    bg: 'bg-gray-200 dark:bg-gray-800',
    border: 'border-dashed border-gray-400 dark:border-gray-600',
    hoverBg: 'hover:bg-gray-300 dark:hover:bg-gray-700',
    hoverBorder: 'hover:border-gray-500 dark:hover:border-gray-500',
  },
  storyGradient: 'from-yellow-400 via-red-500 to-purple-500',
  storyBg: 'bg-white dark:bg-[#121212]',
  avatarBg: 'from-pink-500 to-orange-400',
};

const StoriesReel = ({ onStoryClick, onCreateStoryClick }) => {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reelRef = useRef(null);

  // Função para rolagem horizontal suave
  const handleWheel = (e) => {
    if (reelRef.current) {
      e.preventDefault();
      reelRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    // Não tenta buscar stories se não está logado OU não confirmou e-mail
    if (!currentUser || !currentUser.emailVerified) {
      setStories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getFirestore();
    // Stories que não expiraram ainda (expiresAt > agora)
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '>', new Date()),
      orderBy('expiresAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storiesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          storiesData.push({
            id: doc.id,
            userName: data.userDisplayName || 'Usuário',
            imageUrl: data.mediaType === 'image' ? data.mediaUrl : null,
            avatarText: data.userDisplayName ? data.userDisplayName[0] : '?',
            isOwn: currentUser && data.userId === currentUser.uid,
            unseen: false, // Placeholder para lógica futura
            ...data,
          });
        });
        setStories(storiesData);
        setLoading(false);
      },
      (err) => {
        setError('Erro ao carregar stories ou sem permissão de acesso.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Loader enquanto carrega
  if (loading) {
    return (
      <section className={`${colors.bg} py-3 px-4 rounded-xl shadow-sm`}>
        <div className="animate-pulse flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[80px] h-28 rounded-xl bg-gray-300 dark:bg-gray-800"
            />
          ))}
        </div>
      </section>
    );
  }

  // Mensagem de erro ou falta de permissão
  if (error) {
    return (
      <section className={`${colors.bg} py-3 px-4 rounded-xl shadow-sm`}>
        <div className="text-red-500 text-center py-6">{error}</div>
      </section>
    );
  }

  // Nenhum story
  if (stories.length === 0) {
    return (
      <section className={`${colors.bg} py-3 px-4 rounded-xl shadow-sm`}>
        <div className="flex items-center space-x-4">
          <div>
            <button
              onClick={onCreateStoryClick}
              className="flex flex-col items-center justify-center w-[80px] text-center group"
            >
              <div
                className={`h-28 w-20 rounded-xl ${colors.createBtn.bg} border-2 ${colors.createBtn.border}`}
                style={{ position: 'relative' }}
              >
                <img
                  src="/images/default-cover.png"
                  alt="Criar story"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none"></div>
              </div>
              <span
                className={`text-xs font-medium ${colors.text} mt-2 truncate w-full`}
              >
                Criar Story
              </span>
            </button>
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-4">
            {!currentUser || !currentUser.emailVerified
              ? 'Faça login e confirme o e-mail para ver stories!'
              : 'Nenhum story recente. Seja o primeiro a postar!'}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="stories-heading"
      className={`${colors.bg} py-3 px-4 rounded-xl shadow-sm dark:shadow-none`}
    >
      <div
        ref={reelRef}
        onWheel={handleWheel}
        className="flex items-center space-x-4 overflow-x-auto py-2 scrollbar-hide"
      >
        {/* Botão Criar Story */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <button
            onClick={onCreateStoryClick}
            aria-label="Criar story"
            className="flex flex-col items-center justify-center w-[80px] text-center group transition-all duration-200"
          >
            <div
              className={`h-28 w-20 rounded-xl overflow-hidden flex items-center justify-center ${colors.createBtn.bg} border-2 ${colors.createBtn.border} ${colors.createBtn.hoverBg} ${colors.createBtn.hoverBorder} transition-all`}
              style={{ position: 'relative' }}
            >
              <img
                src="/images/default-cover.png"
                alt="Criar story"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none"></div>
            </div>
            <span
              className={`text-xs font-medium ${colors.text} ${colors.hoverText} mt-2 truncate w-full transition-colors`}
            >
              Criar Story
            </span>
          </button>
        </div>

        {/* Stories ativos */}
        {stories.map((story) => {
          if (story.isOwn) return null;
          return (
            <div
              key={story.id}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <button
                onClick={() => onStoryClick(story)}
                aria-label={`Ver story de ${story.userName}`}
                className="flex flex-col items-center justify-center w-[80px] text-center group"
              >
                <div
                  className={`h-28 w-20 rounded-xl p-0.5 bg-gradient-to-tr ${colors.storyGradient}`}
                >
                  <div
                    className={`${colors.storyBg} p-0.5 rounded-xl h-full w-full flex items-center justify-center`}
                  >
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt={story.userName}
                        className="h-full w-full rounded-xl object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-pink-500 to-orange-400 text-white">
                        {story.avatarText}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${colors.text} ${colors.hoverText} mt-2 truncate w-full transition-colors`}
                >
                  {story.userName}
                </span>
              </button>
              {story.unseen && (
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              )}
            </div>
          );
        })}
        {/* Espaço vazio para rolagem */}
        <div className="flex-shrink-0 w-4 h-1"></div>
      </div>
    </section>
  );
};

StoriesReel.propTypes = {
  onStoryClick: PropTypes.func.isRequired,
  onCreateStoryClick: PropTypes.func.isRequired,
};

export default StoriesReel;
