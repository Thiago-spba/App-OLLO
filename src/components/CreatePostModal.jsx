// src/components/CreatePostModal.jsx
import { useEffect, useRef } from 'react';
import CreatePost from './CreatePost'; // Importa o componente de criação de post
import { XMarkIcon } from '@heroicons/react/24/solid'; // Ícone para o botão de fechar

function CreatePostModal({ onClose, onAddPost }) {
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

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-ollo-deep"
      >
        {/* Cabeçalho do Modal com Título e Botão de Fechar */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="create-post-modal-title" className="text-xl font-semibold text-ollo-accent-light">
            Criar Nova Postagem
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo do Modal - O formulário de CreatePost */}
        <CreatePost onAddPost={onAddPost} />
      </div>
    </div>
  );
}

export default CreatePostModal;