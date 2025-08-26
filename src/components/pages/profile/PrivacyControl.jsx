// ARQUIVO FINAL E CORRIGIDO: src/components/pages/profile/PrivacyControl.jsx

import React from 'react';
// Hooks globais removidos.
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/solid';

// O componente agora recebe tudo o que precisa via props.
export default function PrivacyControl({
  mediaId,
  currentPrivacy,
  onUpdatePrivacy,
  loading,
}) {
  const handleTogglePrivacy = (e) => {
    // Impede que o clique no controle abra o modal da imagem.
    e.stopPropagation();
    if (loading) return;

    const newPrivacy = currentPrivacy === 'public' ? 'private' : 'public';
    // Chama a função passada pelo pai.
    if (onUpdatePrivacy) {
      onUpdatePrivacy(mediaId, newPrivacy);
    }
  };

  const isPublic = currentPrivacy === 'public';
  const Icon = isPublic ? GlobeAltIcon : LockClosedIcon;
  const title = isPublic ? 'Tornar privado' : 'Tornar público';

  return (
    <button
      onClick={handleTogglePrivacy}
      title={title}
      disabled={loading}
      className="absolute top-1 left-1 bg-black/60 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/80 transition-all z-10"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
