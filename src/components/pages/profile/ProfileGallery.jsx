// src/components/pages/profile/ProfileGallery.jsx
import { useState } from 'react';
import EyeIcon from './eyeIcon';

export default function ProfileGallery({
  profile,
  editing,
  form,
  handlers,
  galleryInputRef,
}) {
  // Decide qual galeria mostrar
  const filteredGallery = editing
    ? form.gallery || []
    : (profile.gallery || []).filter(
        (item) => profile.showGallery && item.public
      );

  const showGallery = editing ? form.showGallery : profile.showGallery;

  // --- NOVO: Permitir upload fora do modo edição também ---
  // O upload agora aparece SEMPRE, mas só permite adicionar, sem ações de edição
  const handleAddMedia = !editing ? handlers.handleGalleryChange : null;
  const inputRef = !editing ? galleryInputRef : galleryInputRef;

  // NOVO: State para modal de visualização de mídia
  const [modalMedia, setModalMedia] = useState(null);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">
          Galeria
        </h2>
        <button
          type="button"
          onClick={() => handlers.toggleVisibility('showGallery')}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
          aria-label={showGallery ? 'Ocultar galeria' : 'Mostrar galeria'}
        >
          <EyeIcon visible={showGallery} />
        </button>
        {/* --- Botão de adicionar mídia sempre visível --- */}
        <label className="ml-auto px-3 py-1 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700">
          + Mídia
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            multiple
            className="hidden"
            onChange={handleAddMedia || handlers.handleGalleryChange}
            ref={inputRef}
          />
        </label>
      </div>
      {showGallery ? (
        <div>
          {/* Fotos */}
          <div>
            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fotos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGallery.filter((item) => item.type === 'image').length >
              0 ? (
                filteredGallery
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700 group"
                      onClick={() => setModalMedia(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={item.url}
                        alt="Galeria"
                        className="object-cover w-full h-full"
                      />
                      {/* Overlay de ações */}
                      {editing && (
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlers.handleRemoveMedia(item.id);
                            }}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Remover mídia"
                          >
                            ×
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlers.toggleMediaVisibility(item.id);
                            }}
                            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label={
                              item.public ? 'Tornar privado' : 'Tornar público'
                            }
                          >
                            <EyeIcon visible={item.public} />
                          </button>
                        </div>
                      )}
                      {/* Indicador de visibilidade */}
                      {!editing && item.public && (
                        <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1">
                          <EyeIcon visible={true} />
                        </span>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-gray-400 col-span-2 sm:col-span-3 md:col-span-4 text-center py-4">
                  Nenhuma foto na galeria.
                </div>
              )}
            </div>
          </div>
          {/* Vídeos */}
          <div className="mt-6">
            <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
              Vídeos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGallery.filter((item) => item.type === 'video').length >
              0 ? (
                filteredGallery
                  .filter((item) => item.type === 'video')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700 group"
                      onClick={() => setModalMedia(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <video
                        src={item.url}
                        controls
                        className="object-cover w-full h-full"
                      />
                      {/* Overlay de ações */}
                      {editing && (
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlers.handleRemoveMedia(item.id);
                            }}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Remover mídia"
                          >
                            ×
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlers.toggleMediaVisibility(item.id);
                            }}
                            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label={
                              item.public ? 'Tornar privado' : 'Tornar público'
                            }
                          >
                            <EyeIcon visible={item.public} />
                          </button>
                        </div>
                      )}
                      {/* Indicador de visibilidade */}
                      {!editing && item.public && (
                        <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1">
                          <EyeIcon visible={true} />
                        </span>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-gray-400 col-span-2 sm:col-span-3 md:col-span-4 text-center py-4">
                  Nenhum vídeo na galeria.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 py-4">Galeria oculta</div>
      )}

      {/* Modal de visualização de mídia - NOVO, só adiciona! */}
      {modalMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalMedia(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-full max-w-xl md:max-w-[33vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalMedia(null)}
              className="absolute -top-10 right-0 sm:top-0 sm:-right-12 bg-gray-200/50 dark:bg-gray-700/50 rounded-full p-2 text-white hover:bg-gray-300/70 dark:hover:bg-gray-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white z-10"
              aria-label="Fechar modal"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 id="modal-title" className="sr-only">
              Visualização de {modalMedia.type === 'image' ? 'imagem' : 'vídeo'}
            </h2>
            {modalMedia.type === 'image' ? (
              <img
                src={modalMedia.url}
                alt="Preview em tela reduzida"
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            ) : (
              <video
                src={modalMedia.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
