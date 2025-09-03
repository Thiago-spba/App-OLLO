// ARQUIVO: src/components/PostForm/PostForm.jsx

import { useState, useEffect, useRef } from 'react';
import {
  PaperPlaneRight,
  Image,
  VideoCamera,
  X,
  Smiley,
  SpinnerGap,
  UserCircle, // MUDANÇA: Adicionamos um ícone de fallback mais elegante
} from '@phosphor-icons/react';
import { db, storage } from '../../firebase/config'; // MUDANÇA: Importando storage direto de config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext'; // MUDANÇA: Importando o hook para pegar o usuário logado
import { toast } from 'react-hot-toast'; // MUDANÇA: Usaremos toast para feedback

// CORREÇÃO: O componente agora busca o currentUser diretamente do AuthContext.
// Isso simplifica o fluxo de dados, eliminando a necessidade de passar a prop 'currentUser'.
export default function PostForm({ onPost, onClose }) {
  const { currentUser } = useAuth(); // MUDANÇA: Usando nosso hook de autenticação como fonte da verdade

  const [content, setContent] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]); // MUDANÇA: Separando arquivos de previews
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formContainerRef = useRef(null); // SEU CÓDIGO PRESERVADO

  // SEU CÓDIGO 100% PRESERVADO
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [mediaPreviews]);

  // SEU CÓDIGO 100% PRESERVADO
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
      toast.error('Alguns arquivos são muito grandes (máximo 5MB).');
      return;
    }

    const newFileEntries = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
    }));

    const newPreviewEntries = newFileEntries.map((entry) => ({
      id: entry.id,
      url: URL.createObjectURL(entry.file),
      type: entry.file.type.startsWith('video') ? 'video' : 'image',
    }));

    setMediaFiles((prev) => [...prev, ...newFileEntries]);
    setMediaPreviews((prev) => [...prev, ...newPreviewEntries]);
  };

  const removeMedia = (previewId) => {
    const previewToRemove = mediaPreviews.find((p) => p.id === previewId);
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
      setMediaPreviews((prev) => prev.filter((p) => p.id !== previewId));
      setMediaFiles((prev) => prev.filter((f) => f.id !== previewId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Escreva algo ou adicione uma mídia para publicar.');
      return;
    }

    if (!currentUser) {
      toast.error('Você precisa estar logado para publicar!');
      return;
    }

    setIsSubmitting(true);
    let uploadedMedia = [];
    try {
      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (mediaFile) => {
          const storageRef = ref(
            storage,
            `posts/${currentUser.uid}/${mediaFile.id}-${mediaFile.file.name}`
          );
          await uploadBytes(storageRef, mediaFile.file);
          const downloadURL = await getDownloadURL(storageRef);
          return {
            url: downloadURL,
            type: mediaFile.file.type.startsWith('video') ? 'video' : 'image',
          };
        });
        uploadedMedia = await Promise.all(uploadPromises);
      }

      // CORREÇÃO: Padronizando os campos do documento do post com camelCase para consistência.
      const newPostData = {
        content: content.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.name || 'Usuário OLLO', // Vem do nosso AuthContext
        authorAvatar: currentUser.avatarUrl || null, // Vem do nosso AuthContext
        media: uploadedMedia,
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
      };

      const postsCollectionRef = collection(db, 'posts');
      await addDoc(postsCollectionRef, newPostData);

      setContent('');
      setMediaFiles([]);
      setMediaPreviews([]);
      toast.success('Post publicado com sucesso!');

      if (onPost) {
        // SEU CÓDIGO PRESERVADO
        onPost(newPostData);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao criar post ou fazer upload de mídia:', error);
      toast.error('Ocorreu um erro ao publicar seu post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SEU CÓDIGO 100% PRESERVADO
  const triggerFileInput = (type) => {
    fileInputRef.current.accept = type === 'image/*' ? 'image/*' : 'video/*';
    fileInputRef.current.click();
  };

  // SEU JSX COMPLETO E DETALHADO, 100% PRESERVADO
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        ref={formContainerRef}
        className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-green-300 dark:border-green-600 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden border-2 border-ollo-primary-400">
            {/* MUDANÇA: Lógica de imagem de perfil aprimorada */}
            {currentUser && !avatarError && currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Seu avatar"
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <UserCircle
                size={48}
                className="text-gray-400 dark:text-gray-500 h-full w-full"
              />
            )}
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
          // MELHORIA: Placeholder dinâmico para uma experiência mais pessoal.
          placeholder={`No que você está pensando, ${currentUser?.name || 'OLLO'}?`}
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
                  onClick={() => removeMedia(preview.id, preview.url)}
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
            type="button"
            onClick={handleSubmit} // MUDANÇA: O botão agora chama o handleSubmit
            disabled={
              isSubmitting || (!content.trim() && mediaFiles.length === 0)
            }
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              (!content.trim() && mediaFiles.length === 0) || isSubmitting
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
