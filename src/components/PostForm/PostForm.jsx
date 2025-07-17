// src/components/PostForm/PostForm.jsx
// atualizado em junho de 2025

import { useState, useEffect, useRef } from 'react';
import {
  PaperPlaneRight,
  Image,
  VideoCamera,
  X,
  Smiley,
  SpinnerGap,
} from '@phosphor-icons/react';
// IMPORTAÇÕES DO FIREBASE FIRESTORE E AUTH
import { db, auth } from '../../firebase/config'; // Caminho para seu firebase/config.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Para upload de mídia

// Certifique-se de que o onClose está sendo passado como prop, conforme combinado anteriormente
export default function PostForm({ onPost, currentUser, onClose }) {
  // Adicionei onClose aqui
  const [content, setContent] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formContainerRef = useRef(null);

  // Inicializa o Storage do Firebase
  const storage = getStorage();

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [mediaPreviews]);

  useEffect(() => {
    const currentFormContainerRef = formContainerRef.current;
    let resizeObserver;

    if (currentFormContainerRef) {
      resizeObserver = new ResizeObserver(() => {
        if (formContainerRef.current) {
          formContainerRef.current.style.maxHeight = '80vh';
          formContainerRef.current.style.overflowY = 'auto';
        }
      });
      resizeObserver.observe(currentFormContainerRef);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length) {
      alert('Alguns arquivos são muito grandes (máximo 5MB).');
      return;
    }

    const newPreviews = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file, // Mantemos o objeto File original para upload
    }));

    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Alterada para async para lidar com upload e Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaPreviews.length === 0) {
      // Alterei para === 0 para clareza
      alert('O conteúdo do post não pode estar vazio nem sem mídia!');
      return;
    }

    setIsSubmitting(true);

    // Verificação de autenticação no início do submit
    if (!auth.currentUser) {
      alert('Você precisa estar logado para publicar!');
      setIsSubmitting(false);
      // Opcional: Aqui você poderia redirecionar para o login
      return;
    }

    let uploadedMedia = [];
    try {
      // 1. Upload de Mídia (se houver)
      if (mediaPreviews.length > 0) {
        const uploadPromises = mediaPreviews.map(async (preview) => {
          const storageRef = ref(
            storage,
            `posts/${auth.currentUser.uid}/${preview.id}-${preview.file.name}`
          );
          await uploadBytes(storageRef, preview.file);
          const downloadURL = await getDownloadURL(storageRef);
          return {
            url: downloadURL,
            type: preview.type,
            // Poderíamos adicionar outras infos do arquivo original aqui se necessário
          };
        });
        uploadedMedia = await Promise.all(uploadPromises);
      }

      // 2. Criar o objeto do post para o Firestore
      const newPostData = {
        uid: auth.currentUser.uid, // ID do usuário autenticado (ESSENCIAL para as regras)
        userName: auth.currentUser.displayName || 'Usuário OLLO', // Nome do usuário
        userPhotoURL: auth.currentUser.photoURL || '/images/default-avatar.png', // URL da foto do usuário
        content: content.trim(),
        media: uploadedMedia, // Usar as URLs das mídias carregadas
        createdAt: serverTimestamp(), // Carimbo de data/hora do servidor
        likes: [], // Pode ser um array de UIDs ou um contador, dependendo da sua estratégia
        commentsCount: 0,
      };

      // 3. Adicionar o documento ao Firestore
      const postsCollectionRef = collection(db, 'posts');
      await addDoc(postsCollectionRef, newPostData);

      // 4. Limpar o formulário e fechar o modal
      setContent('');
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url)); // Limpa as URLs de preview
      setMediaPreviews([]);
      // onPost pode ser chamada aqui se você tem uma lógica no pai para atualizar a lista
      // onPost(newPostData); // Passa os dados do novo post para o pai, se necessário

      alert('Post publicado com sucesso!'); // Feedback visual

      // Chamada para fechar o modal, se a prop onClose for fornecida
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao criar post ou fazer upload de mídia:', error);
      alert('Ocorreu um erro ao publicar seu post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = (previewId) => {
    const previewToRemove = mediaPreviews.find((p) => p.id === previewId);
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
      setMediaPreviews((prev) => prev.filter((p) => p.id !== previewId));
    }
  };

  const triggerFileInput = (type) => {
    fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
    fileInputRef.current.click();
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const avatarSrc = avatarError
    ? '/images/default-avatar.png'
    : currentUser?.avatarUrl || '/images/default-avatar.png';

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        ref={formContainerRef}
        className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-green-300 dark:border-green-600 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-ollo-primary-400">
            <img
              src={avatarSrc}
              alt="Avatar"
              className="h-full w-full object-cover"
              onError={handleAvatarError}
            />
          </div>

          <div className="flex-grow">
            <h2 className="text-xl font-bold text-ollo-dark-900 dark:text-ollo-light-100 mb-1">
              Criar publicação
            </h2>
            <p className="text-sm text-ollo-dark-500 dark:text-ollo-light-400">
              Compartilhe algo incrível com a comunidade
            </p>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          placeholder="No que você está pensando?"
          className="w-full min-h-[120px] p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ollo-primary-400/50 focus:border-transparent transition-all"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {mediaPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mediaPreviews.map((preview) => (
              <div
                key={preview.id}
                className="relative group rounded-lg overflow-hidden border border-ollo-primary-100/50 dark:border-ollo-dark-600/50 bg-ollo-light-100/30 dark:bg-ollo-dark-700/30"
              >
                <div className="flex items-center justify-center max-h-[300px] overflow-hidden">
                  {preview.type === 'video' ? (
                    <video
                      src={preview.url}
                      controls
                      className="w-full max-h-[300px] object-contain"
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-full max-h-[300px] object-contain"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMedia(preview.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="Remover mídia"
                >
                  <X size={16} weight="bold" className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-ollo-light-100/50 dark:bg-ollo-dark-700/50 border border-ollo-light-200/50 dark:border-ollo-dark-600/50">
          <span className="text-sm font-medium text-ollo-dark-600 dark:text-ollo-light-300">
            Adicionar à publicação
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => triggerFileInput('image')}
              className="p-2 rounded-lg hover:bg-ollo-primary-50 dark:hover:bg-ollo-dark-600 transition-colors group"
              title="Foto"
            >
              <Image
                size={22}
                weight="duotone"
                className="text-ollo-primary-500 group-hover:text-ollo-primary-600 dark:text-ollo-primary-400 dark:group-hover:text-ollo-primary-300"
              />
            </button>

            <button
              type="button"
              onClick={() => triggerFileInput('video')}
              className="p-2 rounded-lg hover:bg-ollo-accent-50 dark:hover:bg-ollo-dark-600 transition-colors group"
              title="Vídeo"
            >
              <VideoCamera
                size={22}
                weight="duotone"
                className="text-ollo-accent-500 group-hover:text-ollo-accent-600 dark:text-ollo-accent-400 dark:group-hover:text-ollo-accent-300"
              />
            </button>

            <button
              type="button"
              className="p-2 rounded-lg hover:bg-ollo-yellow-50 dark:hover:bg-ollo-dark-600 transition-colors group"
              title="Emoji"
            >
              <Smiley
                size={22}
                weight="duotone"
                className="text-ollo-yellow-500 group-hover:text-ollo-yellow-600 dark:text-ollo-yellow-400 dark:group-hover:text-ollo-yellow-300"
              />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleMediaChange}
              multiple
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit} // Chamando a função handleSubmit
            disabled={
              isSubmitting || (!content.trim() && mediaPreviews.length === 0)
            }
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              (!content.trim() && mediaPreviews.length === 0) || isSubmitting
                ? 'bg-ollo-light-300 dark:bg-ollo-dark-600 text-ollo-dark-400 dark:text-ollo-dark-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-ollo-primary-500 to-ollo-primary-600 hover:from-ollo-primary-600 hover:to-ollo-primary-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <>
                <SpinnerGap size={20} className="animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <PaperPlaneRight size={20} weight="bold" />
                Publicar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-300/40 to-green-400/40 dark:from-green-500/30 dark:to-green-400/30 blur-sm -z-10" />
    </div>
  );
}
