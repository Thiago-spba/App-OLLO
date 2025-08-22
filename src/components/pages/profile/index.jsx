// ARQUIVO FINALIZADO: src/components/pages/profile/index.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

// MUDANÇA ESTRUTURAL: Importamos nosso novo store do Zustand e o renomeamos.
import { useProfileStore } from '../../../hooks/useProfileStore';

// Seus subcomponentes, sem alteração.
import ProfileHeader from './ProfileHeader.jsx';
import ProfileBio from './ProfileBio.jsx';
import ProfileGallery from './ProfileGallery.jsx';
import ProfileActions from './ProfileActions.jsx';

export default function Profile({ profileData, isOwner }) {
  const { currentUser } = useAuth();

  // MUDANÇA ESTRUTURAL: Selecionamos os dados e ações que precisamos do store.
  // Usar seletores assim (state => state.actions) é mais otimizado.
  const actions = useProfileStore((state) => state.actions);
  const editing = useProfileStore((state) => state.editing);
  const form = useProfileStore((state) => state.form);
  const loading = useProfileStore((state) => state.loading);
  const error = useProfileStore((state) => state.error);
  const success = useProfileStore((state) => state.success);
  const initialProfileData = useProfileStore(
    (state) => state.initialProfileData
  );
  const avatarFile = useProfileStore((state) => state.avatarFile);
  const coverFile = useProfileStore((state) => state.coverFile);

  // EXPLICAÇÃO: Este useEffect é crucial. Ele "sincroniza" os dados que vêm de fora
  // (profileData e currentUser) com o nosso store Zustand, inicializando-o.
  useEffect(() => {
    if (profileData) {
      actions.initialize(profileData);
    }
    if (currentUser) {
      actions.setCurrentUser(currentUser);
    }
  }, [profileData, currentUser, actions]);

  // Se o formulário ainda não foi inicializado pelo useEffect, mostramos um loading.
  if (!form) {
    return <div className="text-center p-8">Carregando perfil...</div>;
  }

  // A lógica para verificar se o formulário foi alterado.
  const isDirty =
    JSON.stringify(form) !== JSON.stringify(initialProfileData) ||
    !!avatarFile ||
    !!coverFile;

  return (
    <main className="max-w-2xl mx-auto bg-white dark:bg-gray-800/50 shadow-xl rounded-2xl my-4 md:my-8">
      <ProfileHeader
        profile={initialProfileData} // Usamos o initialProfileData para a visualização
        editing={editing}
        form={form}
        handlers={actions}
        isOwner={isOwner}
      />
      <ProfileBio
        profile={initialProfileData}
        editing={editing}
        form={form}
        handlers={actions}
      />
      <ProfileGallery
        profile={initialProfileData}
        editing={editing}
        form={form}
        handlers={actions}
        isOwner={isOwner}
        loading={loading}
      />

      {(error || success) && (
        <div className="my-4 text-center p-4">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      )}

      {isOwner && (
        <ProfileActions
          editing={editing}
          loading={loading}
          isDirty={isDirty}
          onEdit={actions.handleEdit}
          onCancel={actions.handleCancel}
          // CORREÇÃO: A chamada onSave agora não precisa de argumentos,
          // pois o store já tem acesso ao currentUser.
          onSave={actions.handleSave}
        />
      )}
    </main>
  );
}
