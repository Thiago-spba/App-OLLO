// src/components/pages/profile/ProfileHeader.jsx - VERSÃO COMPLETA REFATORADA

import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/solid';

// Skeleton para estado de carregamento
const ProfileHeaderSkeleton = () => (
  <div className="w-full animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white pb-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    {/* Banner skeleton */}
    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 sm:h-52"></div>

    {/* Avatar skeleton */}
    <div className="relative -mt-16 flex justify-center">
      <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700"></div>
    </div>

    {/* Texto skeleton */}
    <div className="p-4 text-center">
      <div className="mx-auto mb-2 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mx-auto h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>

    {/* Botão skeleton */}
    <div className="px-4">
      <div className="mx-auto h-10 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

export default function ProfileHeader({
  profileData,
  editing = false,
  isOwner = false,
  loading = false,
  onHandleChange,
  onHandleFileChange,
  onHandleEdit,
  onHandleSave,
  onHandleCancel,
}) {
  // Se não há dados do perfil, mostra skeleton
  if (!profileData) {
    return <ProfileHeaderSkeleton />;
  }

  // Determina qual imagem usar (preview tem prioridade sobre URL salva)
  const getCoverImage = () => {
    if (profileData.coverPreview) return profileData.coverPreview;
    if (profileData.coverURL) return profileData.coverURL;
    return '/api/placeholder/800/200'; // Placeholder padrão
  };

  const getAvatarImage = () => {
    if (profileData.avatarPreview) return profileData.avatarPreview;
    if (profileData.avatarURL) return profileData.avatarURL;
    return '/api/placeholder/150/150'; // Placeholder padrão
  };

  const coverImage = getCoverImage();
  const avatarImage = getAvatarImage();

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* SEÇÃO DO BANNER */}
      <div className="relative h-40 w-full sm:h-52">
        {/* Imagem do banner */}
        <img
          src={coverImage}
          alt="Banner do perfil"
          className="h-full w-full object-cover"
          onError={(e) => {
            console.warn('Erro ao carregar imagem de capa, usando fallback');
            e.target.src = '/api/placeholder/800/200';
          }}
        />

        {/* Overlay para upload do banner (apenas para dono em modo edição) */}
        {isOwner && editing && (
          <label
            htmlFor="cover-upload"
            className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all duration-200 hover:bg-opacity-50"
            title="Clique para alterar o banner"
          >
            <div className="flex flex-col items-center text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <CameraIcon className="h-10 w-10 mb-2" />
              <span className="text-sm font-semibold">Alterar Banner</span>
            </div>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                onHandleFileChange && onHandleFileChange(e, 'cover')
              }
              disabled={loading}
            />
          </label>
        )}

        {/* Indicador de loading durante upload */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* SEÇÃO DO AVATAR */}
      <div className="relative -mt-16 flex justify-center pb-4">
        <div className="relative">
          {/* Imagem do avatar */}
          <img
            src={avatarImage}
            alt={`Avatar de ${profileData.name || profileData.username || 'Usuário'}`}
            className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 object-cover shadow-xl dark:border-gray-800 dark:bg-gray-700"
            onError={(e) => {
              console.warn('Erro ao carregar avatar, usando fallback');
              e.target.src = '/api/placeholder/150/150';
            }}
          />

          {/* Botão para alterar avatar (apenas para dono em modo edição) */}
          {isOwner && editing && (
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-ollo-accent p-2.5 text-white shadow-lg transition-all duration-200 hover:bg-ollo-accent-light hover:scale-110"
              title="Clique para alterar o avatar"
            >
              <CameraIcon className="h-5 w-5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onHandleFileChange && onHandleFileChange(e, 'avatar')
                }
                disabled={loading}
              />
            </label>
          )}
        </div>
      </div>

      {/* SEÇÃO DAS INFORMAÇÕES DO USUÁRIO */}
      <div className="px-6 pb-4 text-center">
        {editing ? (
          // Modo de edição
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={onHandleChange}
              placeholder="Seu nome completo"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-ollo-accent focus:outline-none focus:ring-2 focus:ring-ollo-accent/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              disabled={loading}
            />

            <input
              type="text"
              name="bio"
              value={profileData.bio || ''}
              onChange={onHandleChange}
              placeholder="Conte um pouco sobre você..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-gray-600 placeholder-gray-400 focus:border-ollo-accent focus:outline-none focus:ring-2 focus:ring-ollo-accent/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-500"
              disabled={loading}
            />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profileData.username}
            </p>
          </div>
        ) : (
          // Modo de visualização
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profileData.name || 'Nome não informado'}
            </h1>

            {profileData.bio && (
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {profileData.bio}
              </p>
            )}

            <p className="text-base text-gray-500 dark:text-gray-400">
              @{profileData.username}
            </p>

            {/* Estatísticas (opcional - você pode adicionar depois) */}
            {profileData.stats && (
              <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {profileData.stats.posts || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {profileData.stats.followers || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Seguidores
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {profileData.stats.following || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Seguindo
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO DOS BOTÕES DE AÇÃO */}
      {isOwner && (
        <div className="px-6 pb-6">
          {editing ? (
            // Botões do modo edição
            <div className="flex gap-3">
              <button
                onClick={onHandleSave}
                disabled={loading}
                className="flex-1 rounded-lg bg-ollo-accent px-6 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-ollo-accent-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ollo-accent/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Alterações'
                )}
              </button>

              <button
                onClick={onHandleCancel}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
              >
                Cancelar
              </button>
            </div>
          ) : (
            // Botão do modo visualização
            <button
              onClick={onHandleEdit}
              className="w-full rounded-lg bg-ollo-accent px-6 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-ollo-accent-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ollo-accent/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Editar Perfil
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// PropTypes para validação das props
ProfileHeader.propTypes = {
  profileData: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
    avatarURL: PropTypes.string,
    coverURL: PropTypes.string,
    avatarPreview: PropTypes.string,
    coverPreview: PropTypes.string,
    stats: PropTypes.shape({
      posts: PropTypes.number,
      followers: PropTypes.number,
      following: PropTypes.number,
    }),
  }),
  editing: PropTypes.bool,
  isOwner: PropTypes.bool,
  loading: PropTypes.bool,
  onHandleChange: PropTypes.func,
  onHandleFileChange: PropTypes.func,
  onHandleEdit: PropTypes.func,
  onHandleSave: PropTypes.func,
  onHandleCancel: PropTypes.func,
};
