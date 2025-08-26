// ARQUIVO: src/components/pages/profile/ProfileBio.jsx

import React from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const ProfileBioSkeleton = () => (
  <section className="p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </section>
);

export default function ProfileBio() {
  const form = useProfileStore((state) => state.form);
  const initialProfileData = useProfileStore(
    (state) => state.initialProfileData
  );
  const editing = useProfileStore((state) => state.editing);
  const { handleChange } = useProfileStore((state) => state.actions);

  const MAX_BIO_LENGTH = 180;

  if (!form || !initialProfileData) {
    return <ProfileBioSkeleton />;
  }

  const { bio, showBio } = initialProfileData;

  return (
    <section className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Sobre Mim
        </h2>
      </div>

      {editing ? (
        <div>
          <textarea
            name="bio"
            value={form.bio || ''}
            onChange={handleChange}
            maxLength={MAX_BIO_LENGTH}
            rows={4}
            className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ollo-accent-light"
            placeholder="Fale um pouco sobre você..."
          />
          <p className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">
            {form.bio?.length || 0} / {MAX_BIO_LENGTH}
          </p>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 min-h-[4rem]">
          {showBio ? (
            bio ? (
              <p>{bio}</p>
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
