// src/components/pages/profile/ProfileHeader.jsx

import React from 'react';
// MUDANÇA: Importando PropTypes para validação de props. Uma boa prática para componentes reutilizáveis.
import PropTypes from 'prop-types';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const ProfileHeaderSkeleton = () => (
  <div className="w-full animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white pb-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 sm:h-52"></div>
    <div className="relative -mt-16 flex justify-center">
      <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700"></div>
    </div>
    <div className="p-4 text-center">
      <div className="mx-auto mb-2 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mx-auto h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

export default function ProfileHeader({
  profileData,
  editing,
  isOwner,
  loading,
  onHandleChange,
  onHandleFileChange,
  onHandleEdit,
  onHandleSave,
  onHandleCancel,
}) {
  if (!profileData) {
    return <ProfileHeaderSkeleton />;
  }

  // MUDANÇA: Lógica de pré-visualização (Optimistic UI)
  // O `useProfileStore` irá nos fornecer uma URL temporária 'coverPreview' ou 'avatarPreview' ao selecionar um arquivo.
  // Priorizamos essa URL de preview. Se não existir, usamos a URL do banco de dados (`coverURL` ou `avatarURL`).
  // Se nenhuma existir, usamos a imagem padrão.
  const coverImage =
    profileData.coverPreview || profileData.coverURL || '/default-cover.png';
  const avatarImage =
    profileData.avatarPreview || profileData.avatarURL || '/default-avatar.png';

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white pb-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* MUDANÇA: Estrutura do Banner para melhor UX de upload */}
      <div className="relative h-40 w-full bg-gray-200 dark:bg-gray-700 sm:h-52">
        <img
          src={coverImage}
          alt="Banner do perfil"
          className="h-full w-full object-cover"
        />
        {isOwner && editing && (
          // MUDANÇA: A label agora envolve toda a área interativa. A classe 'group' do Tailwind é a chave aqui.
          <label
            htmlFor="cover-upload"
            className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition hover:bg-opacity-40"
          >
            <div className="flex flex-col items-center text-white opacity-0 transition group-hover:opacity-100">
              <ArrowUpTrayIcon className="h-8 w-8" />
              <span className="mt-1 text-sm font-semibold">Alterar Banner</span>
            </div>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onHandleFileChange(e, 'cover')}
            />
          </label>
        )}
      </div>

      <div className="relative -mt-16 flex justify-center">
        <div className="relative">
          <img
            src={avatarImage}
            alt="Avatar"
            className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 object-cover shadow-lg dark:border-gray-800 dark:bg-gray-700"
          />
          {isOwner && editing && (
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-1 cursor-pointer rounded-full bg-ollo-accent p-2 text-white shadow-md transition-colors hover:bg-ollo-accent-light"
              title="Trocar avatar"
            >
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => onHandleFileChange(e, 'avatar')}
                className="hidden"
              />
              <ArrowUpTrayIcon className="h-5 w-5" />
            </label>
          )}
        </div>
      </div>

      <div className="p-4 text-center">
        {editing ? (
          <>
            <input
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={onHandleChange}
              placeholder="Seu Nome"
              className="block w-full rounded-md bg-gray-100 py-1 text-center text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-ollo-accent-light dark:bg-gray-700 dark:text-gray-100"
            />
            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
              @{profileData.username}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profileData.name || 'Nome não preenchido'}
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              @{profileData.username}
            </p>
          </>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center justify-center gap-4 px-4">
          {editing ? (
            <>
              <button
                onClick={onHandleSave}
                disabled={loading}
                className="flex-1 justify-center rounded-md border border-transparent bg-ollo-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-ollo-accent-light focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 disabled:opacity-50 sm:flex-none sm:w-32"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={onHandleCancel}
                disabled={loading}
                className="flex-1 justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:flex-none sm:w-32"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={onHandleEdit}
              className="flex-1 justify-center rounded-md border border-transparent bg-ollo-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-ollo-accent-light focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 sm:flex-none sm:w-48"
            >
              Editar Perfil
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// MUDANÇA: Adicionando PropTypes para garantir a integridade do componente
ProfileHeader.propTypes = {
  profileData: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    // As URLs que vem do banco de dados
    coverURL: PropTypes.string,
    avatarURL: PropTypes.string,
    // As URLs temporárias de preview
    coverPreview: PropTypes.string,
    avatarPreview: PropTypes.string,
  }),
  editing: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onHandleChange: PropTypes.func.isRequired,
  onHandleFileChange: PropTypes.func.isRequired,
  onHandleEdit: PropTypes.func.isRequired,
  onHandleSave: PropTypes.func.isRequired,
  onHandleCancel: PropTypes.func.isRequired,
};
