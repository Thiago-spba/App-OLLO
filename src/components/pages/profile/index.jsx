// ARQUIVO REATORADO: src/pages/profile/index.jsx

import React, { useRef } from 'react';
// MUDANÇA ESTRUTURAL: Removemos quase todos os imports. Agora só precisamos do nosso hook.
import { useProfileEditor } from '../../../hooks/useProfileEditor';

// MUDANÇA: Mantemos os imports dos seus subcomponentes. Eles continuam corretos.
import ProfileHeader from './ProfileHeader.jsx';
import ProfileBio from './ProfileBio.jsx';
import ProfileGallery from './ProfileGallery.jsx';
import ProfileActions from './ProfileActions.jsx';

// CORREÇÃO: O nome do componente foi alterado de "ProfilePage" para "Profile" para refletir sua nova responsabilidade.
// CORREÇÃO: A função agora recebe 'profileData' e 'isOwner' como props, em vez de buscar dados por conta própria.
export default function Profile({ profileData, isOwner }) {
  // MUDANÇA ESTRUTURAL: Toda a lógica complexa de useState e useCallback foi substituída
  // por esta única linha. Nosso hook `useProfileEditor` agora gerencia tudo.
  const { editing, form, loading, error, success, isDirty, actions, handlers } =
    useProfileEditor(profileData);

  const galleryInputRef = useRef(null);

  // EXPLICAÇÃO: O JSX permanece quase o mesmo, mas agora ele é mais limpo,
  // pois os dados e funções vêm de fontes bem definidas (props e o hook).
  return (
    <main className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-lg my-4 md:my-8 p-4 md:p-6">
      <ProfileHeader
        profile={profileData}
        editing={editing}
        form={form}
        handlers={handlers}
        isOwner={isOwner}
      />
      <ProfileBio
        profile={profileData}
        editing={editing}
        form={form}
        handlers={handlers}
      />
      <ProfileGallery
        profile={profileData}
        editing={editing}
        form={form}
        handlers={handlers}
        galleryInputRef={galleryInputRef}
        loading={loading}
      />

      {(error || success) && (
        <div className="my-4 text-center p-4">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      )}

      {/* A lógica de só mostrar os botões para o dono do perfil agora é explícita e clara. */}
      {isOwner && (
        <ProfileActions
          editing={editing}
          loading={loading}
          isDirty={isDirty}
          onEdit={actions.handleEdit}
          onCancel={actions.handleCancel}
          onSave={actions.handleSave}
        />
      )}
    </main>
  );
}
