// ARQUIVO: src/components/pages/profile/ProfileGallery.jsx

import React, { useState, useEffect } from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { useAuth } from '@/context/AuthContext';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import MediaItem from './MediaItem'; // Assumindo que MediaItem.jsx existe
import { toast } from 'react-hot-toast';

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
  // --- Lendo dados do nosso cérebro (Zustand) ---
  const { initialProfileData, media, editing, loading } = useProfileStore();
  const { initialize, handleMediaUpload } = useProfileStore(
    (state) => state.actions
  );

  // --- Lendo o usuário logado da fonte correta (AuthContext) ---
  const { currentUser, loading: authLoading } = useAuth();
  const isOwner =
    !authLoading && currentUser && currentUser.uid === initialProfileData?.id;

  // --- Estado local apenas para controle da UI deste componente ---
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Efeito para buscar e ouvir as mídias do Firestore em tempo real
  useEffect(() => {
    if (!initialProfileData?.id) return;

    const mediaCollectionRef = collection(
      db,
      'users',
      initialProfileData.id,
      'media'
    );
    let q;
    if (isOwner) {
      q = query(mediaCollectionRef, orderBy('createdAt', 'desc'));
    } else {
      q = query(
        mediaCollectionRef,
        where('privacy', '==', 'public'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mediaData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sincroniza os dados do Firestore com nosso store
        initialize(initialProfileData, mediaData);
        setLoadingMedia(false);
      },
      (error) => {
        console.error('OLLO: Erro ao buscar mídias da galeria:', error);
        setLoadingMedia(false);
        toast.error('Não foi possível carregar a galeria.');
      }
    );

    return () => unsubscribe();
  }, [initialProfileData, isOwner, initialize]);

  // MUDANÇA: Função para lidar com a seleção de arquivos
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleMediaUpload(file);
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = null;
  };

  if (!initialProfileData) {
    return <ProfileGallerySkeleton />;
  }

  const photos = media.filter((item) => item.type?.startsWith('image'));
  const videos = media.filter((item) => item.type?.startsWith('video'));

  return (
    <section className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Galeria
        </h2>
      </div>

      {loadingMedia ? (
        <ProfileGallerySkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* MUDANÇA: Botão para adicionar mídia aparece primeiro, se aplicável */}
          {isOwner && editing && (
            <label
              className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-ollo-accent dark:hover:border-ollo-accent transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center text-gray-400 dark:text-gray-500">
                <PlusCircleIcon className="h-10 w-10 mx-auto" />
                <span className="mt-2 block text-sm font-medium">
                  Adicionar
                </span>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </label>
          )}

          {/* Renderiza os itens de mídia existentes */}
          {media.map((item) => (
            <MediaItem key={item.id} item={item} onSelect={setSelectedMedia} />
          ))}
        </div>
      )}

      {media.length === 0 && !editing && (
        <p className="text-gray-400 text-sm italic mt-4">
          Nenhuma mídia na galeria.
        </p>
      )}

      {/* Modal para visualizar mídia em tela cheia */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative w-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-2 -right-2 sm:top-0 sm:-right-10 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 transition-colors z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            {selectedMedia.type?.startsWith('image') ? (
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
