// src/components/pages/profile/ProfileBio.jsx
import EyeIcon from './eyeIcon';

export default function ProfileBio({ profile, editing, form, handlers }) {
  // Decide qual valor e visibilidade usar
  const bioValue = editing ? form.bio : profile.bio;
  const showBio = editing ? form.showBio : profile.showBio;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">
          Bio
        </h2>
        <button
          type="button"
          onClick={() => handlers.toggleVisibility('showBio')}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
          aria-label={showBio ? 'Ocultar bio' : 'Mostrar bio'}
        >
          <EyeIcon visible={showBio} />
        </button>
      </div>
      {editing ? (
        <textarea
          name="bio"
          value={form.bio}
          onChange={handlers.handleChange}
          maxLength={180}
          rows={3}
          className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          placeholder="Fale sobre você (até 180 caracteres)"
        />
      ) : (
        <div className="text-gray-800 dark:text-gray-200 min-h-[1.5rem]">
          {showBio && bioValue ? (
            bioValue
          ) : (
            <span className="text-gray-400">Bio oculta</span>
          )}
        </div>
      )}
    </section>
  );
}
