// src/pages/profile/ProfileGallery.jsx (VERSÃO CORRIGIDA)

import { useState } from 'react';
import EyeIcon from './eyeIcon';
import { FiX } from 'react-icons/fi';

export default function ProfileGallery({
  profile,
  editing,
  form,
  handlers,
  galleryInputRef,
  loading,
}) {
  const [selectedMedia, setSelectedMedia] = useState(null);

  const galleryItems = editing ? form.gallery || [] : profile.gallery || [];
  const photos = galleryItems.filter((item) => item.type === 'image');
  const videos = galleryItems.filter((item) => item.type === 'video');
  const isGalleryVisible = editing ? form.showGallery : profile.showGallery;

  const closeModal = () => setSelectedMedia(null);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">
          Galeria
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          {editing && (
            <button
              type="button"
              onClick={() => handlers.toggleVisibility('showGallery')}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <EyeIcon visible={isGalleryVisible} />
            </button>
          )}
          <label
            className={`px-3 py-1 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 text-sm font-medium transition-all duration-200 hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            + Mídia
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handlers.handleInstantUpload}
              ref={galleryInputRef}
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
          Fotos
        </h3>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
              >
                <img
                  src={item.url}
                  alt="Foto da galeria"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {editing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.handleRemoveMedia(item.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Nenhuma foto na galeria.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
          Vídeos
        </h3>
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {videos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
              >
                <video
                  src={item.url}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {editing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlers.handleRemoveMedia(item.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Nenhum vídeo na galeria.
          </p>
        )}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-auto max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-2 -right-2 sm:top-0 sm:-right-10 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors z-10"
            >
              <FiX size={24} />
            </button>
            <div className="p-1.5 bg-gray-900/50 rounded-lg border-2 border-emerald-400 dark:border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.6)] dark:shadow-[0_0_25px_rgba(16,185,129,0.7)]">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Mídia em destaque"
                  className="max-h-[85vh] max-w-[90vw] rounded-md object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-[90vw] rounded-md object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
