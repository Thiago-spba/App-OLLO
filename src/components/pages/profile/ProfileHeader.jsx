// CÓDIGO FINAL E À PROVA DE FALHAS: src/components/pages/profile/ProfileHeader.jsx

import React from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { useAuth } from '@/context/AuthContext';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const ProfileHeaderSkeleton = () => (
  <div className="w-full rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-40 sm:h-52 bg-gray-300 dark:bg-gray-700"></div>
    <div className="relative flex justify-center -mt-16">
      <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800"></div>
    </div>
    <div className="text-center p-4 pb-6">
      <div className="h-7 w-48 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-5 w-32 mx-auto bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
    </div>
  </div>
);

export default function ProfileHeader() {
  const initialProfileData = useProfileStore(
    (state) => state.initialProfileData
  );
  const form = useProfileStore((state) => state.form);
  const editing = useProfileStore((state) => state.editing);
  const loadingStore = useProfileStore((state) => state.loading);
  const {
    handleChange,
    handleFileChange,
    handleEdit,
    handleSave,
    handleCancel,
  } = useProfileStore((state) => state.actions);

  const { currentUser, loading: authLoading } = useAuth();

  // ARQUITETURA: Lógica 'isOwner' explícita para máxima clareza
  const profileId = initialProfileData?.id;
  const currentUserId = currentUser?.uid;
  const isOwner =
    !authLoading && !!currentUser && !!profileId && currentUserId === profileId;

  if (!form || !initialProfileData) {
    return <ProfileHeaderSkeleton />;
  }

  const coverImage = editing ? form.cover : initialProfileData.cover;
  const avatarImage = editing ? form.avatar : initialProfileData.avatar;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pb-6">
      {/* Capa */}
      <div className="relative w-full h-40 sm:h-52 bg-gray-200 dark:bg-gray-700">
        <img
          src={coverImage}
          alt="Capa do perfil"
          className="w-full h-full object-cover"
        />
        {isOwner && editing && (
          <label className="absolute bottom-2 right-2 bg-ollo-accent text-white py-1 px-3 rounded-lg shadow cursor-pointer hover:bg-ollo-accent-light text-sm font-semibold transition-colors">
            Trocar capa
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'cover')}
            />
          </label>
        )}
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-16">
        <div className="relative">
          <img
            src={avatarImage}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-gray-100 dark:bg-gray-700"
          />
          {isOwner && editing && (
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-1 bg-ollo-accent text-white p-2 rounded-full cursor-pointer hover:bg-ollo-accent-light shadow-md transition-colors"
              title="Trocar avatar"
            >
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
                className="hidden"
              />
              <ArrowUpTrayIcon className="w-5 h-5" />
            </label>
          )}
        </div>
      </div>

      {/* Informações do Perfil */}
      <div className="text-center p-4">
        {editing ? (
          <>
            <input
              type="text"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              placeholder="Seu Nome"
              className="text-2xl font-bold text-center block w-full bg-gray-100 dark:bg-gray-700 rounded-md py-1 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-ollo-accent-light outline-none"
            />
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              @{initialProfileData.username}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialProfileData.name || 'Nome não preenchido'}
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              @{initialProfileData.username}
            </p>
          </>
        )}
      </div>

      {/* Painel de Controle de Edição */}
      {isOwner && (
        <div className="flex justify-center items-center gap-4 px-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loadingStore}
                className="flex-1 sm:flex-none sm:w-32 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-accent hover:bg-ollo-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-accent-light disabled:opacity-50"
              >
                {loadingStore ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loadingStore}
                className="flex-1 sm:flex-none sm:w-32 justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex-1 sm:flex-none sm:w-48 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-accent hover:bg-ollo-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-accent-light"
            >
              Editar Perfil
            </button>
          )}
        </div>
      )}
    </div>
  );
}
