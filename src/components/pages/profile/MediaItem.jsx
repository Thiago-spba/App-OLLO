// ARQUIVO: src/components/pages/profile/MediaItem.jsx

import React from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { useAuth } from '@/context/AuthContext';
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import PrivacyControl from './PrivacyControl';

export default function MediaItem({ item, onSelect }) {
  // --- Lendo dados do nosso cérebro (Zustand) ---
  const { initialProfileData, editing } = useProfileStore();
  const { handleMediaDelete } = useProfileStore((state) => state.actions);

  // --- Lendo o usuário logado da fonte correta (AuthContext) ---
  const { currentUser, loading: authLoading } = useAuth();

  // --- Lógica de permissão robusta ---
  const isOwner =
    !authLoading && currentUser && currentUser.uid === initialProfileData?.id;

  const handleDelete = (e) => {
    e.stopPropagation();
    handleMediaDelete(item);
  };

  const isImage = item.type?.startsWith('image');
  const isVideo = item.type?.startsWith('video');

  return (
    <div
      onClick={() => onSelect(item)}
      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
    >
      {isImage && (
        <img
          src={item.url}
          alt="Foto da galeria"
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      )}
      {isVideo && (
        <>
          <video
            src={item.url}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/50 p-1 rounded-full pointer-events-none">
            <VideoCameraIcon className="h-4 w-4 text-white" />
          </div>
        </>
      )}

      {/* CONDIÇÃO FINAL: Mostra os controles se for o dono E estiver no modo de edição */}
      {isOwner && editing && (
        <>
          <PrivacyControl mediaId={item.id} currentPrivacy={item.privacy} />
          <button
            onClick={handleDelete}
            className="absolute top-1 right-1 bg-red-600/80 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Excluir mídia"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
