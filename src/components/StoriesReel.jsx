// src/components/StoriesReel.jsx
import React from 'react';

const mockStories = [
    { id: 1, userName: "Seu Story", avatarText: "Sua Foto", isOwn: true, imageUrl: 'https://placehold.co/150x240/A0D2DB/005A4B?text=+' },
    { id: 2, userName: "Gemini", avatarText: "GA", imageUrl: 'https://placehold.co/150x240/005A4B/FFFFFF?text=GA' },
    { id: 3, userName: "Dev Ent.", avatarText: "DE", imageUrl: 'https://placehold.co/150x240/87CEEB/000000?text=DE' },
    { id: 4, userName: "Usuário C", avatarText: "UC", imageUrl: 'https://placehold.co/150x240/CCCCCC/000000?text=UC' },
    { id: 5, userName: "Usuário D", avatarText: "UD", imageUrl: 'https://placehold.co/150x240/A0D2DB/005A4B?text=UD' },
    { id: 6, userName: "Usuário E", avatarText: "UE", imageUrl: 'https://placehold.co/150x240/005A4B/FFFFFF?text=UE' },
];

const StoryCard = ({ story, darkMode }) => {
    const cardBase = `relative flex-shrink-0 w-28 h-48 sm:w-32 sm:h-56 rounded-xl overflow-hidden cursor-pointer 
                      shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 
                      ${darkMode ? 'focus:ring-ollo-accent-light' : 'focus:ring-ollo-deep'}`;
    
    const overlayClass = 'absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent';
    const textClass = 'absolute bottom-2 left-2 right-2 text-white text-xs sm:text-sm font-semibold truncate';
    const avatarContainerClass = `absolute top-3 left-3 h-10 w-10 rounded-full flex items-center justify-center border-2
                                 ${story.isOwn ? (darkMode ? 'bg-gray-200' : 'bg-white') : (darkMode ? 'bg-gray-700 border-ollo-accent-light' : 'bg-ollo-deep border-ollo-crystal-green')}`;
    const avatarTextClass = story.isOwn 
        ? (darkMode ? 'text-ollo-deep' : 'text-ollo-deep') 
        : (darkMode ? 'text-ollo-bg-light' : 'text-ollo-bg-light');

    return (
        <div className={cardBase} title={story.userName} onClick={() => console.log(`Story de ${story.userName} clicada.`)}>
            <img src={story.imageUrl} alt={`Story de ${story.userName}`} className="w-full h-full object-cover" />
            <div className={overlayClass}></div>
            <div className={avatarContainerClass}>
                {story.isOwn ? (
                    <span className={`text-2xl font-bold ${avatarTextClass}`}>+</span>
                ) : (
                    <span className={`text-sm font-bold ${avatarTextClass}`}>{story.avatarText}</span>
                )}
            </div>
            <p className={textClass}>{story.isOwn ? "Criar Story" : story.userName}</p>
        </div>
    );
};

const StoriesReel = ({ darkMode }) => {
    const scrollContainerClasses = `flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-hide`;

    return (
        <section aria-labelledby="stories-heading" className={`py-4 md:py-1 rounded-lg ${darkMode ? 'bg-gray-800/30' : 'bg-white/50'}`}>
            <div className="max-w-full mx-auto px-1 sm:px-0">
                <h2 id="stories-heading" className="sr-only">Stories</h2>
                <div className={scrollContainerClasses}>
                    {mockStories.map(story => (
                        <StoryCard key={story.id} story={story} darkMode={darkMode} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StoriesReel;