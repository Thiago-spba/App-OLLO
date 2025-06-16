// PostForm.jsx - com Logo Correto:
// junho de 2025

import { useState, useEffect } from 'react';
import { PaperPlaneRight, Image, VideoCamera, X } from '@phosphor-icons/react';

export default function PostForm({ onPost }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean up media URL on unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande (máximo 5MB)');
      return;
    }

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    setIsSubmitting(true);
    try {
      const newPost = {
        id: Date.now(),
        content: content.trim(),
        media: mediaPreview,
        mediaType: media?.type.startsWith('video') ? 'video' : 'image',
        createdAt: new Date().toISOString(),
      };
      await onPost(newPost);
      setContent('');
      setMedia(null);
      setMediaPreview(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = () => {
    URL.revokeObjectURL(mediaPreview);
    setMedia(null);
    setMediaPreview(null);
  };

  return (
    <div className="relative">
      {/* Fundo com logo e blur */}
      <div className="absolute -inset-2 overflow-hidden rounded-2xl z-0">
        <div className="absolute inset-0 bg-olloPrimary100/20 dark:bg-olloDark700/30 backdrop-blur-sm" />
        <div className="absolute right-4 top-4 opacity-20 dark:opacity-10">
        </div>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/90 dark:bg-olloDark800/90 p-6 rounded-2xl shadow-xl border border-olloLight200/50 dark:border-olloDark600/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-olloPrimary500 p-2 rounded-lg">
            <PaperPlaneRight size={24} weight="fill" className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-olloDark800 dark:text-olloLight100">
              Criar Nova Postagem
            </h2>
            <p className="text-sm text-olloDark500 dark:text-olloLight300">
              Compartilhe com a comunidade OLLO
            </p>
          </div>
        </div>

        <textarea
          placeholder="No que você está pensando?"
          className="w-full p-4 rounded-xl border border-olloLight300 dark:border-olloDark600 bg-white dark:bg-olloDark700 text-olloDark900 dark:text-olloLight100 placeholder-olloDark400 dark:placeholder-olloLight300 resize-none focus:ring-2 focus:ring-olloPrimary500 focus:border-transparent outline-none transition"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 flex items-center gap-3">
          {/* Botão Foto */}
          <label className="flex items-center gap-2 px-4 py-2 bg-olloLight100 dark:bg-olloDark700 hover:bg-olloLight200 dark:hover:bg-olloDark600 rounded-lg cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleMediaChange}
              className="hidden"
            />
            <Image size={20} weight="duotone" className="text-olloPrimary500" />
            <span className="text-sm font-medium text-olloDark700 dark:text-olloLight200">
              Foto
            </span>
          </label>

          {/* Botão Vídeo */}
          <label className="flex items-center gap-2 px-4 py-2 bg-olloLight100 dark:bg-olloDark700 hover:bg-olloLight200 dark:hover:bg-olloDark600 rounded-lg cursor-pointer transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleMediaChange}
              className="hidden"
            />
            <VideoCamera
              size={20}
              weight="duotone"
              className="text-olloPrimary500"
            />
            <span className="text-sm font-medium text-olloDark700 dark:text-olloLight200">
              Vídeo
            </span>
          </label>
        </div>

        {/* Preview da mídia */}
        {mediaPreview && (
          <div className="mt-4 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-olloPrimary300 to-olloPrimary500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative overflow-hidden rounded-xl">
              {media?.type.startsWith('video') ? (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full max-h-96 object-cover"
                />
              )}

              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-3 right-3 bg-olloDark800/90 hover:bg-olloDark900 text-white p-1.5 rounded-full shadow-md transition-all"
                aria-label="Remover mídia"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Botão de envio */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !media)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg
              ${
                !content.trim() && !media
                  ? 'bg-olloLight300 dark:bg-olloDark600 text-olloDark400 dark:text-olloLight500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-olloPrimary500 to-olloPrimary600 hover:from-olloPrimary600 hover:to-olloPrimary700 text-white hover:shadow-xl'
              }
              ${isSubmitting ? 'opacity-80' : ''}
            `}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Publicando...</span>
            ) : (
              <>
                <PaperPlaneRight size={20} weight="bold" />
                Publicar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
