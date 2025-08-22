// ARQUIVO FINALIZADO: src/components/pages/profile/ProfileGallery.jsx

import React, { useState, useEffect } from 'react';
// MUDANÇA ARQUITETÔNICA: Importamos o store com o nome correto.
import { useProfileStore } from '@/hooks/useProfileStore';
// MUDANÇA: Usando ícones do nosso kit padrão.
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const ProfileGallerySkeleton = () => (
  <section className="p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg hidden sm:block"></div>
    </div>
  </section>
);

export default function ProfileGallery() {
  // MUDANÇA ARQUITETÔNICA: Usando seletores otimizados do Zustand.
  const initialProfileData = useProfileStore(
    (state) => state.initialProfileData
  );
  const form = useProfileStore((state) => state.form);
  const isOwner = useProfileStore((state) => state.isOwner);
  const editing = useProfileStore((state) => state.editing);
  // MELHORIA: Renomeamos o 'loading' do store para evitar conflito com o estado local.
  const isUploading = useProfileStore((state) => state.loading);
  const { handleMediaUpload, handleMediaDelete, toggleVisibility } =
    useProfileStore((state) => state.actions);

  const [mediaItems, setMediaItems] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // EXPLICAÇÃO: Sua lógica de busca de dados em tempo real está perfeita e foi mantida.
  useEffect(() => {
    const profileId = initialProfileData?.id;
    if (!profileId) return;

    setLoadingMedia(true);
    const mediaCollectionRef = collection(db, 'users', profileId, 'media');
    const q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mediaData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const visibleMedia = isOwner
          ? mediaData
          : mediaData.filter((item) => item.privacy !== 'private');
        setMediaItems(visibleMedia);
        setLoadingMedia(false);
      },
      (error) => {
        console.error('OLLO: Erro ao buscar mídias da galeria:', error);
        setLoadingMedia(false);
      }
    );

    return () => unsubscribe();
  }, [initialProfileData?.id, isOwner]);

  if (!initialProfileData) {
    return <ProfileGallerySkeleton />;
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      // CORREÇÃO: A ação agora não precisa mais do currentUser, pois o store já o conhece.
      handleMediaUpload(file);
    });
  };

  const closeModal = () => setSelectedMedia(null);

  const photos = mediaItems.filter((item) => item.type === 'image');
  const videos = mediaItems.filter((item) => item.type === 'video');
  const isGalleryVisible = editing
    ? form?.showGallery
    : initialProfileData.showGallery;

  return (
    <section className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Galeria
        </h2>
        {isOwner && editing && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => toggleVisibility('showGallery')}
              title={isGalleryVisible ? 'Ocultar galeria' : 'Mostrar galeria'}
            >
              {isGalleryVisible ? (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            <label
              className={`flex items-center gap-2 px-3 py-1.5 bg-ollo-accent text-white rounded-lg cursor-pointer hover:bg-ollo-accent-light text-sm font-medium transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              + Adicionar Mídia
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>

      {loadingMedia ? (
        <ProfileGallerySkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Fotos ({photos.length})
            </h3>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt="Foto da galeria"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isOwner && editing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaDelete(item);
                        }}
                        className="absolute top-1 right-1 bg-red-600/80 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
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
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Vídeos ({videos.length})
            </h3>
            {videos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-900 cursor-pointer"
                  >
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-full">
                      <VideoCameraIcon className="h-4 w-4 text-white" />
                    </div>
                    {isOwner && editing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaDelete(item);
                        }}
                        className="absolute top-1 right-1 bg-red-600/80 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
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
        </div>
      )}

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-2 -right-2 sm:top-0 sm:-right-10 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt="Mídia em destaque"
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
