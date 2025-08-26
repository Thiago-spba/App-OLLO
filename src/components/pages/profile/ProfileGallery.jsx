// ARQUIVO FINAL E CORRIGIDO: src/components/pages/profile/ProfileGallery.jsx

import React, { useState, useEffect } from 'react';
// ... outros imports ...
import MediaItem from './MediaItem';

// Recebe a prop onUpdateMediaPrivacy e a repassa para MediaItem.
export default function ProfileGallery({
  profileData,
  editing,
  isOwner,
  loading,
  onMediaUpload,
  onMediaDelete,
  onUpdateMediaPrivacy, // ✅ RECEBE AQUI
}) {
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  // ... resto do estado ...
  // ... useEffect sem alteração ...
  // ... handleFileSelect sem alteração ...

  return (
    <section /* ... */>
      {/* ... */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {/* ...JSX do botão de adicionar... */}

        {media.map((item) => (
          <MediaItem
            key={item.id}
            item={item}
            onSelect={setSelectedMedia}
            isOwner={isOwner}
            editing={editing}
            onDelete={onMediaDelete}
            onUpdatePrivacy={onUpdateMediaPrivacy} // ✅ PASSA ADIANTE AQUI
            loading={loading} // ✅ PASSA O LOADING ADIANTE
          />
        ))}
      </div>
      {/* ...JSX do modal... */}
    </section>
  );
}
