// ARQUIVO REATORADO: src/components/pages/profile/ProfileActions.jsx

import React from 'react';
// MUDANÇA: Substituímos 'react-icons/fi' por '@heroicons/react' para seguir nosso padrão.
import {
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { ShareButton } from './ShareButton';

export default function ProfileActions({
  editing,
  loading,
  isDirty,
  onEdit,
  onCancel,
  onSave,
}) {
  // EXPLICAÇÃO: Definimos estilos base para os botões para garantir consistência.
  const baseButtonClasses =
    'w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 focus-visible:ring-ollo-accent';
  const primaryButtonClasses =
    'bg-ollo-accent text-white hover:bg-ollo-accent-light disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70';
  const secondaryButtonClasses =
    'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 border border-transparent';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
      {/* MELHORIA: Renderização condicional apenas para os botões que mudam. */}
      {!editing ? (
        <button
          onClick={onEdit}
          className={`${baseButtonClasses} ${primaryButtonClasses}`}
          aria-label="Editar perfil"
        >
          <PencilSquareIcon className="h-5 w-5" />
          <span>Editar Perfil</span>
        </button>
      ) : (
        <>
          <button
            onClick={onCancel}
            disabled={loading}
            className={`${baseButtonClasses} ${secondaryButtonClasses}`}
            aria-label="Cancelar edição"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={onSave}
            disabled={!isDirty || loading}
            className={`${baseButtonClasses} ${primaryButtonClasses}`}
            aria-label={loading ? 'Salvando alterações' : 'Salvar alterações'}
          >
            {/* MELHORIA: Adicionamos um ícone de spinner animado durante o loading. */}
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CheckIcon className="h-5 w-5" />
            )}
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </>
      )}

      {/* MELHORIA: O ShareButton agora fica fora do ternário para evitar repetição de código. */}
      <ShareButton />
    </div>
  );
}
