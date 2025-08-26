// ARQUIVO FINAL E CORRIGIDO: src/components/pages/profile/ProfileGallery.jsx

import React, { useState, useEffect } from 'react';
// Imports de hooks globais removidos.
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import MediaItem from './MediaItem';
import { toast } from 'react-hot-toast';

// O Skeleton continua sendo uma ótima prática.
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

// --- REATORAÇÃO PARA COMPONENTE DE APRESENTAÇÃO COM LÓGICA INTERNA ---
export default function ProfileGallery({
  profileData,
  editing,
  isOwner,
  loading,
  onMediaUpload,
}) {
  // Estado local para a mídia da galeria e controle de UI.
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Efeito para buscar e ouvir as mídias do Firestore em tempo real.
  // Agora depende de `profileData` e `isOwner` recebidos via props.
  useEffect(() => {
    // A busca só começa se tivermos o ID do perfil.
    if (!profileData?.id) {
      setLoadingMedia(false);
      return;
    }
    setLoadingMedia(true);

    const mediaCollectionRef = collection(db, 'users', profileData.id, 'media');

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
        setMedia(mediaData); // Atualiza o estado local do componente.
        setLoadingMedia(false);
      },
      (error) => {
        console.error('OLLO: Erro ao buscar mídias da galeria:', error);
        setLoadingMedia(false);
        toast.error('Não foi possível carregar a galeria.');
      }
    );

    return () => unsubscribe(); // Limpeza do listener ao desmontar.
  }, [profileData?.id, isOwner]); // Dependências explícitas e seguras.

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Chama a função de upload que foi passada via props pelo componente pai.
      onMediaUpload(file);
    }
    event.target.value = null;
  };

  if (!profileData) {
    return <ProfileGallerySkeleton />;
  }

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

          {media.map((item) => (
            <MediaItem key={item.id} item={item} onSelect={setSelectedMedia} />
          ))}
        </div>
      )}

      {media.length === 0 && !loadingMedia && !editing && (
        <p className="text-gray-400 text-sm italic mt-4">
          Nenhuma mídia na galeria.
        </p>
      )}

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
