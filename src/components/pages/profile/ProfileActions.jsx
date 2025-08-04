// src/components/pages/profile/ProfileActions.jsx
import { FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui';
import { ShareButton } from './ShareButton'; // <-- Adicione o import

export default function ProfileActions({
  editing,
  loading,
  isDirty,
  onEdit,
  onCancel,
  onSave,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
      {!editing ? (
        <>
          <Button
            onClick={onEdit}
            variant="primary"
            className="w-full sm:w-auto px-6 py-3 font-bold"
            aria-label="Editar perfil"
          >
            <FiEdit3 className="text-lg" />
            Editar Perfil
          </Button>
          <ShareButton /> {/* <-- Botão sempre visível */}
        </>
      ) : (
        <>
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="secondary"
            className="w-full sm:w-auto px-6 py-3 font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
            aria-label="Cancelar edição"
          >
            <FiX className="text-lg" />
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={!isDirty || loading}
            loading={loading}
            variant="primary"
            className="w-full sm:w-auto px-6 py-3 font-bold"
            aria-label={loading ? 'Salvando alterações' : 'Salvar alterações'}
          >
            {!loading && <FiSave className="text-lg" />}
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <ShareButton /> {/* <-- Botão sempre visível no modo edição também */}
        </>
      )}
    </div>
  );
}
