// ARQUIVO FINAL E CORRIGIDO (COM CONTROLE DE PRIVACIDADE): src/components/pages/profile/ProfileBio.jsx

import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const ProfileBioSkeleton = () => (
  <section className="p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse">
    {/* ...código do skeleton sem alteração... */}
  </section>
);

export default function ProfileBio({ profileData, editing, onHandleChange }) {
  const MAX_BIO_LENGTH = 180;

  if (!profileData) {
    return <ProfileBioSkeleton />;
  }

  // Usamos um fallback para 'showBio' para perfis que talvez não tenham essa propriedade ainda.
  // O `!!` converte para um booleano explícito (true/false).
  const isBioVisible = !!profileData.showBio;

  return (
    <section className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Sobre Mim
        </h2>
      </div>

      {editing ? (
        <div className="space-y-4">
          <textarea
            name="bio"
            value={profileData.bio || ''}
            onChange={onHandleChange}
            maxLength={MAX_BIO_LENGTH}
            rows={4}
            className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ollo-accent-light"
            placeholder="Fale um pouco sobre você..."
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {profileData.bio?.length || 0} / {MAX_BIO_LENGTH}
            </p>

            {/* --- NOVO CONTROLE DE PRIVACIDADE DA BIO --- */}
            <label
              htmlFor="showBio"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="showBio"
                  name="showBio"
                  className="sr-only" // Esconde o checkbox padrão
                  checked={isBioVisible}
                  onChange={onHandleChange}
                />
                <div
                  className={`block w-14 h-8 rounded-full ${isBioVisible ? 'bg-ollo-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isBioVisible ? 'transform translate-x-6' : ''}`}
                ></div>
              </div>
              <div className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                {isBioVisible ? 'Visível' : 'Oculto'}
              </div>
            </label>
            {/* --- FIM DO CONTROLE --- */}
          </div>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 min-h-[4rem]">
          {isBioVisible ? (
            profileData.bio ? (
              <p>{profileData.bio}</p>
            ) : (
              <p className="italic text-gray-400 dark:text-gray-500">
                Nenhuma biografia adicionada ainda.
              </p>
            )
          ) : (
            <p className="italic text-gray-400 dark:text-gray-500">
              A biografia está oculta.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
