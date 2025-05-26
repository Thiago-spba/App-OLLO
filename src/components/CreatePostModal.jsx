// src/components/CreatePostModal.jsx
import { useEffect, useRef } from 'react';
import CreatePost from './CreatePost'; // Importa o componente de criação de post
import { XMarkIcon } from '@heroicons/react/24/solid'; // Ícone para o botão de fechar

function CreatePostModal({ onClose, onAddPost, darkMode }) {
  const modalRef = useRef();

  // Efeito para fechar o modal ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Efeito para fechar o modal com a tecla Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // --- Definições de Estilo com Base no Tema ---
  const modalBgColor = darkMode ? 'bg-ollo-deep' : 'bg-ollo-bg-light';
  const modalBorderColor = darkMode ? 'border-gray-700' : 'border-gray-300';
  const modalTextColor = darkMode ? 'text-gray-200' : 'text-ollo-deep';

  const titleTextColor = darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep';
  
  const closeButtonTextColor = darkMode ? 'text-gray-400 hover:text-ollo-accent-light' : 'text-gray-500 hover:text-ollo-deep';
  const closeButtonHoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-modal-title"
    >
      {/* ESTE É O DIV DO CONTEÚDO DO MODAL */}
      <div
        ref={modalRef}
        // CORRIGIDO: Classes de animação problemáticas removidas para garantir visibilidade
        className={`
          ${modalBgColor} ${modalBorderColor} ${modalTextColor}
          rounded-xl shadow-2xl p-6 w-full max-w-lg relative border
        `}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="create-post-modal-title" className={`text-2xl font-bold ${titleTextColor}`}>
            Criar Nova Postagem
          </h2>
          <button
            onClick={onClose}
            className={`
              p-1.5 rounded-full transition-colors duration-150 ease-in-out
              ${closeButtonTextColor} ${closeButtonHoverBg}
              focus:outline-none focus-visible:ring-2 ${darkMode ? 'focus-visible:ring-ollo-accent-light' : 'focus-visible:ring-ollo-deep'}
            `}
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo do Modal - O formulário de CreatePost */}
        <CreatePost onAddPost={onAddPost} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default CreatePostModal;