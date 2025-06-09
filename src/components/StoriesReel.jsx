// src/components/StoriesReel.jsx

import React from 'react';

// Dados simulados mantidos
const mockStories = [
  {
    id: 1,
    userName: 'Seu Story',
    avatarText: '+',
    isOwn: true,
    imageUrl:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
  },
  {
    id: 2,
    userName: 'Gemini',
    avatarText: 'GA',
    imageUrl:
      'https://images.unsplash.com/photo-1554034483-2610ac3443a5?q=80&w=1887',
  },
  {
    id: 3,
    userName: 'Dev Ent.',
    avatarText: 'DE',
    imageUrl:
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1887',
  },
  {
    id: 4,
    userName: 'Usuário C',
    avatarText: 'UC',
    imageUrl:
      'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2029',
  },
  {
    id: 5,
    userName: 'Usuário D',
    avatarText: 'UD',
    imageUrl:
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=1887',
  },
  {
    id: 6,
    userName: 'Usuário E',
    avatarText: 'UE',
    imageUrl:
      'https://images.unsplash.com/photo-1579546929662-7221826a7f8c?q=80&w=2070',
  },
];
// Nota: Troquei as URLs do placehold.co por imagens do Unsplash para um visual mais agradável.

// Componente StoryCard agora não precisa do prop 'darkMode'
const StoryCard = ({ story }) => {
  return (
    <div
      className="relative flex-shrink-0 w-28 h-48 sm:w-32 sm:h-56 rounded-xl overflow-hidden cursor-pointer 
                       shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 
                       focus:outline-none focus:ring-2 ring-offset-2 dark:ring-offset-ollo-deep 
                       focus:ring-ollo-deep dark:focus:ring-ollo-accent-light"
      title={story.userName}
      onClick={() => console.log(`Story de ${story.userName} clicada.`)}
    >
      <img
        src={story.imageUrl}
        alt={`Story de ${story.userName}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

      <div
        className={`absolute top-3 left-3 h-10 w-10 rounded-full flex items-center justify-center font-bold border-2
                           ${
                             story.isOwn
                               ? 'bg-white text-ollo-deep border-gray-300 dark:bg-gray-200'
                               : 'bg-ollo-deep text-white border-ollo-accent-light dark:bg-ollo-slate'
                           }`}
      >
        <span className={story.isOwn ? 'text-2xl' : 'text-sm'}>
          {story.avatarText}
        </span>
      </div>

      <p className="absolute bottom-2 left-2 right-2 text-white text-xs sm:text-sm font-semibold truncate">
        {story.isOwn ? 'Criar Story' : story.userName}
      </p>
    </div>
  );
};

// Componente StoriesReel agora não precisa do prop 'darkMode'
const StoriesReel = () => {
  return (
    <section
      aria-labelledby="stories-heading"
      className="py-4 md:py-1 rounded-lg bg-white/50 dark:bg-gray-800/30"
    >
      <div className="max-w-full mx-auto px-1 sm:px-0">
        <h2 id="stories-heading" className="sr-only">
          Stories
        </h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-hide">
          {mockStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoriesReel;
