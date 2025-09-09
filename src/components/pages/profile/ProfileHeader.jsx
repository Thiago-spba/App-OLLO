// ARQUIVO: src/components/pages/profile/ProfileHeader.jsx - VERSÃO OTIMIZADA

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CameraIcon } from '@heroicons/react/24/solid';
import Avatar from '../../Avatar';

// Skeleton otimizado para estado de carregamento
const ProfileHeaderSkeleton = React.memo(() => (
  <div className="w-full animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white pb-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 sm:h-52"></div>
    <div className="relative -mt-16 flex justify-center">
      <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700"></div>
    </div>
    <div className="p-4 text-center">
      <div className="mx-auto mb-2 h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mx-auto h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="px-4">
      <div className="mx-auto h-10 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
));

ProfileHeaderSkeleton.displayName = 'ProfileHeaderSkeleton';

// Componente de banner otimizado
const CoverImage = React.memo(
  ({
    coverImage,
    isOwner,
    editing,
    loading,
    onHandleFileChange,
    onCoverError,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = () => {
      setImageLoaded(true);
      setHasError(false);
    };

    const handleImageError = () => {
      console.warn('[ProfileHeader] Erro ao carregar imagem de capa');
      setHasError(true);
      setImageLoaded(false);
      onCoverError && onCoverError();
    };

    return (
      <div className="relative h-40 w-full sm:h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
        {coverImage && !hasError && (
          <img
            src={coverImage}
            alt="Banner do perfil"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* Overlay para upload do banner */}
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

        {/* Indicador de carregamento */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  }
);

CoverImage.displayName = 'CoverImage';

// Componente principal otimizado
const ProfileHeader = React.memo(function ProfileHeader({
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
  const [coverError, setCoverError] = useState(false);

  // Memoização de valores derivados para evitar re-renders desnecessários
  const coverImage = useMemo(
    () => profileData?.coverPreview || profileData?.coverUrl,
    [profileData?.coverPreview, profileData?.coverUrl]
  );

  const avatarImage = useMemo(
    () => profileData?.avatarPreview || profileData?.avatarUrl,
    [profileData?.avatarPreview, profileData?.avatarUrl]
  );

  const userName = useMemo(
    () => profileData?.name || profileData?.displayName || 'Nome não informado',
    [profileData?.name, profileData?.displayName]
  );

  const userHandle = useMemo(
    () => profileData?.username || 'usuario',
    [profileData?.username]
  );

  // Resetar erro quando a imagem muda
  useEffect(() => {
    if (coverImage) {
      setCoverError(false);
    }
  }, [coverImage]);

  // Callback memoizado para upload de arquivos
  const handleFileUpload = useMemo(() => {
    if (!onHandleFileChange) return null;
    return (e, type) => {
      const file = e.target.files?.[0];
      if (file && file.size > 10 * 1024 * 1024) {
        console.warn(
          `[ProfileHeader] Arquivo muito grande: ${file.size} bytes`
        );
        return;
      }
      onHandleFileChange(e, type);
    };
  }, [onHandleFileChange]);

  // Loading state
  if (!profileData) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 transition-shadow duration-200 hover:shadow-xl">
      {/* SEÇÃO DO BANNER */}
      <CoverImage
        coverImage={coverImage}
        isOwner={isOwner}
        editing={editing}
        loading={loading}
        onHandleFileChange={handleFileUpload}
        onCoverError={() => setCoverError(true)}
      />

      {/* SEÇÃO DO AVATAR */}
      <div className="relative -mt-16 flex justify-center pb-4">
        <div className="relative">
          <Avatar
            src={avatarImage}
            alt={`Avatar de ${userName}`}
            className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 object-cover shadow-xl dark:border-gray-800 dark:bg-gray-700 text-gray-400 dark:text-gray-600"
            loading="eager"
          />

          {/* Botão para alterar avatar */}
          {isOwner && editing && (
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-blue-600 p-2.5 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Clique para alterar o avatar"
            >
              <CameraIcon className="h-5 w-5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFileUpload && handleFileUpload(e, 'avatar')
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
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={onHandleChange}
              placeholder="Seu nome completo"
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 transition-colors duration-200"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{userHandle}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
              {userName}
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              @{userHandle}
            </p>
            {profileData.verified && (
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO DOS BOTÕES DE AÇÃO */}
      {isOwner && (
        <div className="px-6 pb-6">
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={onHandleSave}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </span>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
              <button
                onClick={onHandleCancel}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                type="button"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={onHandleEdit}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              type="button"
            >
              Editar Perfil
            </button>
          )}
        </div>
      )}
    </div>
  );
});

// PropTypes para validação em desenvolvimento
ProfileHeader.propTypes = {
  profileData: PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
    avatarPreview: PropTypes.string,
    coverUrl: PropTypes.string,
    coverPreview: PropTypes.string,
    verified: PropTypes.bool,
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

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
