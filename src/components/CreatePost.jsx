// src/components/CreatePost.jsx
import { useState } from 'react';

function CreatePost({ onAddPost, darkMode }) {
  const userName = "Usuário OLLO"; // Placeholder
  const [postText, setPostText] = useState('');

  const handlePostSubmit = () => {
    if (!postText.trim()) {
      return;
    }
    onAddPost(postText);
    setPostText('');
  };

  // --- Definições de Estilo com Base no Tema ---
  const containerBg = darkMode ? 'bg-gray-800' : 'bg-lime-50'; 
  const containerBorder = darkMode ? 'border-gray-700' : 'border-gray-300';

  const avatarRingOffset = darkMode ? 'ring-offset-gray-800' : 'ring-offset-lime-50'; 

  const textareaBg = darkMode ? 'bg-gray-700' : 'bg-gray-50'; 
  const textareaBorder = darkMode ? 'border-gray-600' : 'border-gray-200'; 
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800'; 
  const placeholderColor = darkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const focusRingColor = darkMode ? 'focus:ring-ollo-accent-light' : 'focus:ring-ollo-deep';
  const focusBorderColor = darkMode ? 'focus:border-ollo-accent-light/80' : 'focus:border-ollo-deep/80';

  const actionIconColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const actionIconHoverText = darkMode ? 'hover:text-ollo-accent-light' : 'hover:text-ollo-deep';
  const actionIconHoverBg = darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-lime-100/70'; // (Se lime-100/70 não der bom contraste, podemos usar hover:bg-black/5 ou similar)

  const postButtonBg = darkMode ? 'bg-ollo-accent-light' : 'bg-ollo-deep';
  const postButtonText = darkMode ? 'text-ollo-deep' : 'text-ollo-bg-light';
  const postButtonFocusRing = darkMode ? 'focus:ring-ollo-accent-light/70' : 'focus:ring-ollo-deep/70';
  const postButtonRingOffset = darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-lime-50';

  const IconComponent = ({ title, path }) => (
    <button 
      type="button" 
      title={title} 
      className={`
        w-6 h-6 cursor-pointer transition-all duration-150 ease-in-out p-1 rounded-lg 
        ${actionIconColor} ${actionIconHoverText} ${actionIconHoverBg} hover:scale-110
      `}
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={path}></path>
      </svg>
    </button>
  );

  const ImageIcon = () => <IconComponent title="Adicionar imagem" path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
  const PollIcon = () => <IconComponent title="Criar enquete" path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
  const EmojiIcon = () => <IconComponent title="Adicionar emoji" path="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;

  return (
    <div className={`${containerBg} ${containerBorder} rounded-xl shadow-lg p-4 sm:p-5 border`}>
      <div className="flex items-start space-x-3 sm:space-x-4">
        <img
          className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0 ring-2 ${avatarRingOffset} ring-ollo-accent-light/80`}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=005A4B&color=A0D2DB&bold=true&size=128`}
          alt="Seu avatar"
        />
        <div className="flex-1">
          <textarea
            rows="3"
            className={`
              w-full p-3 border rounded-xl 
              text-sm sm:text-base transition-colors duration-150 ease-in-out resize-none shadow-sm
              ${textareaBg} ${textareaBorder} ${textColor} ${placeholderColor} 
              focus:outline-none focus:ring-2 ${focusRingColor} ${focusBorderColor}
            `}
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
              className={`
                inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold 
                hover:bg-opacity-80 active:scale-95 transition-all duration-150 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md 
                disabled:opacity-60 disabled:cursor-not-allowed
                ${postButtonBg} ${postButtonText} ${postButtonFocusRing} ${postButtonRingOffset}
              `}
              disabled={!postText.trim()}
              title="Publicar seu Ollo"
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