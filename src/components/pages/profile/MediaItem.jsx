// ARQUIVO FINAL E CORRIGIDO: src/components/pages/profile/MediaItem.jsx

import React from 'react';
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';
import PrivacyControl from './PrivacyControl';

// Recebe a prop onUpdatePrivacy e a repassa para PrivacyControl.
export default function MediaItem({
  item,
  onSelect,
  isOwner,
  editing,
  onDelete,
  onUpdatePrivacy, // ✅ RECEBE AQUI
  loading, // ✅ RECEBE O LOADING AQUI
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item);
    }
  };

  const isImage = item.type?.startsWith('image');
  const isVideo = item.type?.startsWith('video');

  return (
    <div
      onClick={() => onSelect(item)}
      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
    >
      {/* ...JSX de imagem e vídeo sem alteração... */}

      {isOwner && editing && (
        <>
          <PrivacyControl
            mediaId={item.id}
            currentPrivacy={item.privacy}
            onUpdatePrivacy={onUpdatePrivacy} // ✅ PASSA ADIANTE AQUI
            loading={loading} // ✅ PASSA O LOADING ADIANTE
          />
          <button onClick={handleDelete} /* ... */>
            <XMarkIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
