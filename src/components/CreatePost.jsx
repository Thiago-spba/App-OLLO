/*
 * CreatePostModal Component
 * 
 * Este componente exibe um modal para criação de novas postagens.
 * Características:
 * - Fecha ao clicar fora ou pressionar Esc
 * - Integra-se com o PostForm para manipulação do conteúdo
 * - Totalmente responsivo e acessível
 * Última atualização: junho de 2025
 */
// src/components/CreatePostModal.jsx

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import PostForm from './PostForm/PostForm'; // Atualizamos aqui

function CreatePostModal({ onClose, onAddPost }) {
  const modalRef = useRef();

  // Fecha ao clicar fora
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

  // Fecha com tecla Esc
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg relative rounded-xl shadow-2xl p-6 
                   bg-ollo-light dark:bg-ollo-deep 
                   border border-gray-300 dark:border-gray-700 
                   text-ollo-deep dark:text-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="create-post-modal-title"
            className="text-2xl font-bold text-ollo-deep dark:text-ollo-accent-light"
          >
            Criar Nova Postagem
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors duration-150 ease-in-out
                       text-gray-500 hover:text-ollo-deep hover:bg-gray-200/50
                       dark:text-gray-400 dark:hover:text-ollo-accent-light dark:hover:bg-gray-700/50
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-ollo-deep dark:focus-visible:ring-ollo-accent-light"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Aqui trocamos CreatePost por PostForm */}
        <PostForm onPost={onAddPost} />
      </div>
    </div>
  );
}

export default CreatePostModal;
