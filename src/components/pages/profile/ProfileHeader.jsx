// ARQUIVO REATORADO E CORRIGIDO: src/components/pages/profile/ProfileHeader.jsx

import React from 'react';
// MUDANÇA ARQUITETÔNICA: Importamos o store com o nome correto.
import { useProfileStore } from '@/hooks/useProfileStore';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/solid';

const ProfileHeaderSkeleton = () => (
  <div className="w-full mb-6 rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
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
  // MUDANÇA ARQUITETÔNICA: Conectando ao store com seletores.
  // Selecionamos apenas os pedaços de estado que este componente precisa.
  const form = useProfileStore((state) => state.form);
  const initialProfileData = useProfileStore(
    (state) => state.initialProfileData
  );
  const editing = useProfileStore((state) => state.editing);
  const isOwner = useProfileStore((state) => state.isOwner); // Supondo que o isOwner também virá do store no futuro

  // Selecionamos as ações que vamos usar.
  const { handleChange, handleFileChange, toggleVisibility } = useProfileStore(
    (state) => state.actions
  );

  // Sua guarda condicional, mantida pois é uma excelente prática.
  if (!form || !initialProfileData) {
    return <ProfileHeaderSkeleton />;
  }

  const coverImage = editing ? form.cover : initialProfileData.cover;
  const avatarImage = editing ? form.avatar : initialProfileData.avatar;
  const emojis = editing ? form.emojis || [] : initialProfileData.emojis || [];

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
              // MUDANÇA: Estilos de formulário padronizados
              className="text-2xl font-bold text-center block w-full bg-gray-100 dark:bg-gray-700 rounded-md py-1 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-ollo-accent-light outline-none"
            />
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              @{initialProfileData.username} {/* Username não é editável */}
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

        <div className="mt-4 flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          {/* Lógica de Localização, Idade, etc. que estava aqui foi movida para o ProfileBio */}
        </div>

        {/* Emojis */}
        <div className="mt-4 flex justify-center items-center flex-wrap gap-2">
          {editing ? (
            // Lógica de edição de emojis
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex flex-wrap justify-center gap-2">
                {emojis.map((emoji, i) => (
                  <span
                    key={i}
                    className="text-2xl cursor-pointer"
                    title="Remover emoji"
                    onClick={() =>
                      handleChange({
                        target: {
                          name: 'emojis',
                          value: emojis.filter((_, idx) => i !== idx),
                        },
                      })
                    }
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <input
                type="text"
                onBlur={(e) => {
                  if (e.target.value) {
                    handleChange({
                      target: {
                        name: 'emojis',
                        value: [...emojis, e.target.value],
                      },
                    });
                    e.target.value = '';
                  }
                }}
                maxLength={2}
                placeholder="😊"
                className="w-16 text-center bg-gray-100 dark:bg-gray-700 rounded-md focus:ring-2 focus:ring-ollo-accent-light outline-none"
              />
            </div>
          ) : (
            emojis.length > 0 && (
              <div className="flex flex-wrap gap-2 text-2xl">
                {emojis.map((emoji, i) => (
                  <span key={i}>{emoji}</span>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
