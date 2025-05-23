// src/components/CreatePost.jsx
import { useState } from 'react';
// Se for adicionar ícone ao botão "Postar", importe aqui. Ex:
// import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

function CreatePost({ onAddPost, darkMode }) { // Adicionada a prop darkMode para consistência, embora não usada diretamente neste exemplo
  const userName = "Usuário OLLO"; // Placeholder

  const [postText, setPostText] = useState('');

  const handlePostSubmit = () => {
    if (!postText.trim()) {
      return;
    }
    onAddPost(postText);
    setPostText('');
  };

  // --- Ícones SVG com classes ajustadas para tema claro ---
  const iconBaseClasses = "w-6 h-6 text-gray-500 cursor-pointer transition-all duration-150 ease-in-out p-1 rounded-lg"; // Aumentado para w-6 h-6
  // Classes de HOVER ajustadas para tema claro
  const iconHoverClasses = "hover:text-ollo-deep hover:bg-gray-100 hover:scale-110";

  const ImageIcon = () => (
    <button type="button" title="Adicionar imagem" className={`${iconBaseClasses} ${iconHoverClasses}`}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    </button>
  );
  const PollIcon = () => (
    <button type="button" title="Criar enquete" className={`${iconBaseClasses} ${iconHoverClasses}`}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
    </button>
  );
  const EmojiIcon = () => (
    <button type="button" title="Adicionar emoji" className={`${iconBaseClasses} ${iconHoverClasses}`}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </button>
  );

  return (
    // --- CONTAINER PRINCIPAL ATUALIZADO PARA TEMA CLARO ---
    // Removido mb-6, pois o componente pai (HomePage ou Modal) deve controlar a margem.
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border border-gray-200/80">
      <div className="flex items-start space-x-3 sm:space-x-4">
        <img 
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0 ring-2 ring-offset-2 ring-offset-white ring-ollo-accent-light/80" 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=005A4B&color=A0D2DB&bold=true&size=128`} 
          alt="Seu avatar" 
        />
        <div className="flex-1">
          <textarea
            rows="3" // Mantido rows 3, pode ajustar para 4 se preferir mais espaço
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ollo-deep focus:border-ollo-deep/80 text-sm sm:text-base transition-colors duration-150 ease-in-out resize-none shadow-sm"
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

            {/* --- BOTÃO "POSTAR" ATUALIZADO PARA TEMA CLARO --- */}
            <button
              onClick={handlePostSubmit}
              className="inline-flex items-center px-5 py-2 bg-ollo-deep text-ollo-bg-light rounded-lg text-sm font-semibold hover:bg-opacity-80 hover:bg-ollo-deep active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-deep/70 focus:ring-offset-2 focus:ring-offset-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!postText.trim()}
              title="Publicar seu Ollo"
            >
              {/* Se quiser ícone: <PaperAirplaneIcon className="h-5 w-5 mr-2 -ml-1 transform rotate-[-25deg]" /> */}
              Postar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;