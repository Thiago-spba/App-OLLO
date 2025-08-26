// CÓDIGO FINAL COM IMAGENS DE FALLBACK: src/components/pages/profile/ProfileHeader.jsx

import React from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const ProfileHeaderSkeleton = () => (
  <div className="w-full rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pb-6 animate-pulse">
    <div className="w-full h-40 sm-h-52 bg-gray-200 dark:bg-gray-700"></div>
    <div className="relative flex justify-center -mt-16">
      <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="text-center p-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
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

    // --- CORREÇÃO DE UI: Adicionando Fallbacks ---
    // Se a imagem no form (para preview) ou no profileData (do db) não existir, usa a imagem padrão.
    const coverImage = (editing ? profileData.cover : profileData.cover) || '/default-cover.png';
    const avatarImage = (editing ? profileData.avatar : profileData.avatar) || '/default-avatar.png';
    // --- FIM DA CORREÇÃO ---
    
    // O resto do componente continua exatamente o mesmo.
    return (
        <div className="w-full rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pb-6">
            <div className="relative w-full h-40 sm-h-52 bg-gray-200 dark:bg-gray-700">
                <img
                    src={coverImage} // Usa a variável com fallback
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
                            onChange={(e) => onHandleFileChange(e, 'cover')}
                        />
                    </label>
                )}
            </div>
            
            <div className="relative flex justify-center -mt-16">
                <div className="relative">
                    <img
                        src={avatarImage} // Usa a variável com fallback
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
                                onChange={(e) => onHandleFileChange(e, 'avatar')}
                                className="hidden"
                            />
                            <ArrowUpTrayIcon className="w-5 h-5" />
                        </label>
                    )}
                </div>
            </div>

            <div className="text-center p-4">
                 {editing ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={profileData.name || ''}
                            onChange={onHandleChange}
                            placeholder="Seu Nome"
                            className="text-2xl font-bold text-center block w-full bg-gray-100 dark:bg-gray-700 rounded-md py-1 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-ollo-accent-light outline-none"
                        />
                        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
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
                <div className="flex justify-center items-center gap-4 px-4">
                    {editing ? (
                        <>
                            <button
                                onClick={onHandleSave}
                                disabled={loading}
                                className="flex-1 sm:flex-none sm:w-32 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ollo-accent hover:bg-ollo-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ollo-accent-light disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                                onClick={onHandleCancel}
                                disabled={loading}
                                className="flex-1 sm:flex-none sm:w-32 justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onHandleEdit}
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