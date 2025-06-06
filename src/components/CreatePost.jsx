// src/components/CreatePost.jsx

import { useState } from 'react';

// Prop 'darkMode' removido
function CreatePost({ onAddPost }) {
  const userName = 'Usuário OLLO';
  const [postText, setPostText] = useState('');

  const handlePostSubmit = () => {
    if (postText.trim()) {
      onAddPost(postText);
      setPostText('');
    }
  };

  const getAvatarUrl = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const bgColor = isDarkMode ? '00A896' : '0D1B2A';
    const textColor = isDarkMode ? '0D1B2A' : 'E0E1DD';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=${bgColor}&color=${textColor}&bold=true&size=128`;
  };

  const IconComponent = ({ title, path }) => (
    <button
      type="button"
      title={title}
      className="p-1 w-8 h-8 rounded-lg cursor-pointer transition-all duration-150 ease-in-out 
                 text-gray-500 hover:text-ollo-deep hover:bg-gray-200/70
                 dark:text-gray-400 dark:hover:text-ollo-accent-light dark:hover:bg-gray-700/50"
    >
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d={path}
        ></path>
      </svg>
    </button>
  );

  const ImageIcon = () => (
    <IconComponent
      title="Adicionar imagem"
      path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  );
  const PollIcon = () => (
    <IconComponent
      title="Criar enquete"
      path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  );
  const EmojiIcon = () => (
    <IconComponent
      title="Adicionar emoji"
      path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  );

  return (
    // O container não precisa mais de cores próprias, pois ele vive dentro do modal que já tem cor
    <div className="rounded-xl">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <img
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0 
                     ring-2 ring-offset-2 ring-ollo-accent-light/80
                     ring-offset-ollo-light dark:ring-offset-ollo-deep"
          src={getAvatarUrl()}
          alt="Seu avatar"
        />
        <div className="flex-1">
          <textarea
            rows="4"
            className="w-full p-3 border rounded-xl shadow-sm resize-none 
                       text-sm sm:text-base transition-colors duration-150 ease-in-out
                       bg-gray-50 dark:bg-gray-800/50 
                       border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-200 
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-ollo-deep dark:focus:ring-ollo-accent-light
                       focus:border-transparent"
            placeholder={`No que você está pensando, ${userName}?`}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-1 sm:space-x-2">
              <ImageIcon />
              <PollIcon />
              <EmojiIcon />
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={!postText.trim()}
              title="Publicar seu Ollo"
              className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold shadow-md
                         transition-all duration-150 ease-in-out active:scale-95 hover:bg-opacity-90 
                         disabled:opacity-60 disabled:cursor-not-allowed
                         bg-ollo-deep text-ollo-light 
                         dark:bg-ollo-accent-light dark:text-ollo-deep
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-ollo-deep dark:focus:ring-ollo-accent-light
                         focus:ring-offset-ollo-light dark:focus:ring-offset-ollo-deep"
            >
              Postar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
