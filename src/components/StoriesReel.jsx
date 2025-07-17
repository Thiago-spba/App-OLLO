// src/components/StoriesReel.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

// --- Sub-componente: Botão "Criar Story" (Design Retangular Corrigido) ---
const CreateStoryButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 flex flex-col items-center w-24 h-40 group"
    aria-label="Criar um novo Story"
  >
    <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-2 bg-white/5 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-300 group-hover:border-ollo-accent-light">
      <img
        src="/images/default-cover.png" // Caminho que você forneceu
        alt="Criar Story"
        className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
      />
      <span className="mt-2 text-xs font-bold text-gray-700 dark:text-gray-200">
        Criar Story
      </span>
    </div>
  </button>
);

// --- Sub-componente: Card de um Story (Design Oval/Circular) ---
const StoryItem = ({ story, onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 flex flex-col items-center w-24 h-40 group relative"
    aria-label={`Ver story de ${story.userName}`}
  >
    <img
      src={story.imageUrl}
      alt={story.userName}
      className="w-full h-full rounded-xl object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl ring-1 ring-inset ring-black/10"></div>
    <div className="absolute top-2 left-2 p-0.5 rounded-full bg-gradient-to-tr from-ollo-crystal-green to-ollo-sky-blue">
      <img
        src={story.userAvatar}
        className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-ollo-deep"
        alt=""
      />
    </div>
    <span className="absolute bottom-2 left-2 text-xs font-bold text-white shadow-lg">
      {story.userName}
    </span>
  </button>
);

const StoriesReel = ({ stories = [], onStoryClick, onCreateStoryClick }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // Não renderiza nada se não houver usuário
  }

  return (
    <section aria-labelledby="stories-heading">
      <h2 id="stories-heading" className="sr-only">
        Stories
      </h2>
      <div className="flex items-center space-x-4 overflow-x-auto py-2 scrollbar-hide">
        <CreateStoryButton onClick={onCreateStoryClick} />
        {stories.map((story) => (
          <StoryItem
            key={story.id}
            story={story}
            onClick={() => onStoryClick(story)}
          />
        ))}
      </div>
    </section>
  );
};

StoriesReel.propTypes = {
  stories: PropTypes.array,
  onStoryClick: PropTypes.func.isRequired,
  onCreateStoryClick: PropTypes.func.isRequired,
};

export default StoriesReel;
