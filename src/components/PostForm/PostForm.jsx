import { useState, useEffect, useRef } from 'react';
import {
  PaperPlaneRight,
  Image,
  VideoCamera,
  X,
  Smiley,
  SpinnerGap,
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';

import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Funções utilitárias
function extractHashtags(text) {
  return text.match(/#\w+/g) || [];
}
function extractMentions(text) {
  return text.match(/@\w+/g) || [];
}

export default function PostForm({ onPost, currentUser }) {
  const [content, setContent] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const formContainerRef = useRef(null);

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [mediaPreviews]);

  useEffect(() => {
    if (formContainerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        formContainerRef.current.style.maxHeight = '80vh';
        formContainerRef.current.style.overflowY = 'auto';
      });
      resizeObserver.observe(formContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const uploadMediaAndGetUrls = async () => {
    if (!mediaPreviews.length) return [];
    const uploadPromises = mediaPreviews.map(async (preview) => {
      const file = preview.file;
      const ext = file.name.split('.').pop();
      const filePath = `posts/${currentUser?.uid || 'anon'}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return { url, type: preview.type };
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaPreviews.length) return;
    setIsSubmitting(true);
    try {
      const uploadedMedia = await uploadMediaAndGetUrls();
      const newPost = {
        userId: currentUser?.uid ?? 'anon',
        userName: currentUser?.name ?? 'Usuário OLLO',
        userAvatar:
          currentUser?.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Usuário OLLO')}&background=21b66f&color=fff&bold=true`,
        content: content.trim(),
        media: uploadedMedia ?? [],
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
        privacy: 'public',
        edited: false,
        editedAt: null,
        hashtags: extractHashtags(content),
        mentions: extractMentions(content),
      };
      await addDoc(collection(db, 'posts'), newPost);
      setContent('');
      setMediaPreviews([]);
      if (onPost) onPost(newPost);
      toast.success('Seu post foi publicado com sucesso! 🚀');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao publicar post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length) {
      toast.error('Alguns arquivos são muito grandes (máximo 5MB)');
      return;
    }
    const newPreviews = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
    }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
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

  const handleAvatarError = () => setAvatarError(true);

  const avatarSrc = avatarError
    ? '/images/default-avatar.png'
    : currentUser?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Usuário OLLO')}&background=21b66f&color=fff&bold=true`;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          ref={formContainerRef}
          className="relative z-10 bg-white/80 dark:bg-ollo-dark-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-green-300 dark:border-green-500/50 max-h-[80vh] overflow-y-auto"
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
            className="w-full min-h-[120px] p-4 rounded-xl bg-ollo-light-50 dark:bg-ollo-dark-700 border border-ollo-light-300/50 dark:border-ollo-dark-600/50 text-ollo-dark-800 dark:text-ollo-light-200 placeholder-ollo-dark-400/70 dark:placeholder-ollo-dark-400/70 resize-none focus:outline-none focus:ring-2 focus:ring-ollo-primary-400/50 focus:border-transparent transition-all"
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
                title="Emoji (em breve)"
                disabled
              >
                <Smiley
                  size={22}
                  weight="duotone"
                  className="text-ollo-yellow-500 group-hover:text-ollo-yellow-600 dark:text-ollo-yellow-400 dark:group-hover:text-ollo-yellow-300 opacity-50"
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
              disabled={
                isSubmitting || (!content.trim() && !mediaPreviews.length)
              }
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                (!content.trim() && mediaPreviews.length === 0) || isSubmitting
                  ? 'bg-ollo-light-300 dark:bg-ollo-dark-600 text-ollo-dark-400 dark:text-ollo-dark-300 cursor-not-allowed opacity-60'
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
      </form>
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-300/40 to-green-400/40 dark:from-green-500/30 dark:to-green-400/30 blur-sm -z-10" />
    </div>
  );
}
