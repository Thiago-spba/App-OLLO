// ARQUIVO NOVO: src/components/pages/profile/PrivacyControl.jsx

import React from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/solid';

// ARQUITETURA: Componente focado com uma única responsabilidade:
// exibir e permitir a troca de estado de privacidade de uma mídia.
export default function PrivacyControl({ mediaId, currentPrivacy }) {
  const { updateMediaPrivacy } = useProfileStore((state) => state.actions);
  const loading = useProfileStore((state) => state.loading);

  const handleTogglePrivacy = (e) => {
    // Impede que o clique no controle abra o modal da imagem.
    e.stopPropagation();
    if (loading) return;

    const newPrivacy = currentPrivacy === 'public' ? 'private' : 'public';
    updateMediaPrivacy(mediaId, newPrivacy);
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
