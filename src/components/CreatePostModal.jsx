import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/solid';
import PostForm from './PostForm/PostForm';

function CreatePostModal({ onClose, onAddPost }) {
  const modalRef = useRef();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      if (onClose) onClose();
      navigate('/login', {
        state: { message: 'Faça login para criar um post!' },
      });
    }
  }, [currentUser, navigate, onClose]);

  if (!currentUser) return null;

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
        className="w-full max-w-lg relative rounded-xl shadow-2xl p-6 bg-gray-100/90 dark:bg-gray-900/90 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="create-post-modal-title"
            className="text-2xl font-bold text-ollo-accent-light dark:text-ollo-deep"
          >
            Criar Nova Postagem
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors duration-150 ease-in-out text-gray-400 hover:text-ollo-accent-light hover:bg-gray-700/50 dark:text-gray-500 dark:hover:text-ollo-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ollo-accent-light dark:focus-visible:ring-ollo-accent"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <PostForm onPost={onAddPost} />
      </div>
    </div>
  );
}

export default CreatePostModal;
