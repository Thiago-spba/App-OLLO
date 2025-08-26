// ARQUIVO FINAL E CORRIGIDO: src/components/pages/profile/MediaItem.jsx

import React from 'react';
// Imports dos hooks globais (useProfileStore, useAuth) são removidos.
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';
import PrivacyControl from './PrivacyControl'; // Assumimos que PrivacyControl será refatorado de forma similar se necessário.

// --- REATORAÇÃO PARA COMPONENTE DE APRESENTAÇÃO ---
// O componente agora recebe tudo o que precisa via props.
export default function MediaItem({
  item,
  onSelect,
  isOwner,
  editing,
  onDelete,
}) {
  const handleDelete = (e) => {
    e.stopPropagation(); // Impede que o clique no botão de delete também abra o modal.
    if (onDelete) {
      onDelete(item); // Chama a função onDelete passada pelo pai.
    }
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

      {/* A lógica de exibição agora usa as props `isOwner` e `editing` */}
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
