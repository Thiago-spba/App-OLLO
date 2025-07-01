import EyeIcon from './eyeIcon';

export default function ProfileHeader({
  profile,
  editing,
  form,
  handlers,
  avatarPreview,
  avatarInputRef,
}) {
  // Garante que campos de array sempre são arrays
  const safeProfile = {
    ...profile,
    emojis: Array.isArray(profile.emojis) ? profile.emojis : [],
  };
  const safeForm = {
    ...form,
    emojis: Array.isArray(form.emojis) ? form.emojis : [],
  };
  const _ = (field) => (editing ? safeForm[field] : safeProfile[field]);

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow bg-white dark:bg-gray-900">
      {/* Capa */}
      <div className="relative w-full h-40 sm:h-52 bg-gray-200 dark:bg-gray-800">
        <img
          src={
            editing ? safeForm.cover || safeProfile.cover : safeProfile.cover
          }
          alt="Capa do perfil"
          className="w-full h-full object-cover"
          style={{ minHeight: 120, maxHeight: 260 }}
        />
        {editing && (
          <label
            className="absolute bottom-2 right-2 bg-emerald-600 text-white py-1 px-3 rounded-lg shadow cursor-pointer hover:bg-emerald-700 text-sm"
            style={{ zIndex: 2 }}
          >
            Trocar capa
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlers.handleCoverChange}
            />
          </label>
        )}
      </div>

      {/* Layout horizontal: infos à esquerda, avatar à direita */}
      <div className="flex flex-row items-start mt-0 sm:-mt-12 px-4 pb-4">
        {/* Infos à esquerda */}
        <div className="flex-1 flex flex-col gap-2 pt-4 sm:pt-12">
          {/* Nome */}
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                type="text"
                name="name"
                value={safeForm.name}
                onChange={handlers.handleChange}
                maxLength={40}
                className="input input-bordered text-xl font-bold px-2 w-52 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Nome"
                required
              />
            ) : (
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {safeProfile.name || 'Nome não preenchido'}
              </span>
            )}
          </div>
          {/* Usuário */}
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                type="text"
                name="username"
                value={safeForm.username}
                onChange={handlers.handleChange}
                maxLength={20}
                className="input input-bordered text-base px-2 w-52 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                placeholder="@usuario"
                required
              />
            ) : (
              <span className="text-base text-gray-500 dark:text-gray-300">
                @{safeProfile.username}
              </span>
            )}
          </div>
          {/* Localização + privacidade */}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <input
                  type="text"
                  name="location"
                  value={safeForm.location}
                  onChange={handlers.handleChange}
                  maxLength={32}
                  className="input input-bordered px-2 w-40 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  placeholder="Cidade, País"
                />
                <button
                  type="button"
                  onClick={() => handlers.toggleVisibility('showLocation')}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                  aria-label={
                    safeForm.showLocation
                      ? 'Ocultar localização'
                      : 'Mostrar localização'
                  }
                >
                  <EyeIcon visible={safeForm.showLocation} />
                </button>
              </>
            ) : safeProfile.showLocation && safeProfile.location ? (
              <>
                <span className="text-gray-600 dark:text-gray-300">
                  {safeProfile.location}
                </span>
                <EyeIcon visible={true} />
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                Localização oculta
              </span>
            )}
          </div>
          {/* Idade + privacidade */}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <input
                  type="number"
                  name="age"
                  value={safeForm.age}
                  min={1}
                  max={120}
                  onChange={handlers.handleChange}
                  className="input input-bordered w-20 px-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  placeholder="Idade"
                />
                <button
                  type="button"
                  onClick={() => handlers.toggleVisibility('showAge')}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                  aria-label={
                    safeForm.showAge ? 'Ocultar idade' : 'Mostrar idade'
                  }
                >
                  <EyeIcon visible={safeForm.showAge} />
                </button>
              </>
            ) : safeProfile.showAge && safeProfile.age ? (
              <>
                <span className="text-gray-600 dark:text-gray-300">
                  {safeProfile.age} anos
                </span>
                <EyeIcon visible={true} />
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                Idade oculta
              </span>
            )}
          </div>
          {/* Status online */}
          <div className="flex items-center mt-1">
            {editing ? (
              <>
                <input
                  type="checkbox"
                  checked={safeForm.statusOnline}
                  onChange={() =>
                    handlers.handleChange({
                      target: {
                        name: 'statusOnline',
                        value: !safeForm.statusOnline,
                      },
                    })
                  }
                  className="mr-2 accent-emerald-600"
                  aria-label="Status online"
                />
                <span className="text-gray-800 dark:text-gray-100">Online</span>
              </>
            ) : (
              _(`statusOnline`) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-xs font-medium">
                  Online
                </span>
              )
            )}
          </div>
          {/* Emojis */}
          <div className="flex flex-wrap items-center gap-1">
            {editing ? (
              <>
                {safeForm.emojis.map((emoji, idx) => (
                  <span
                    key={idx}
                    className="text-xl cursor-pointer"
                    onClick={() =>
                      handlers.handleChange({
                        target: {
                          name: 'emojis',
                          value: safeForm.emojis.filter((_, i) => i !== idx),
                        },
                      })
                    }
                  >
                    {emoji}
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="😊"
                  maxLength={2}
                  className="input input-bordered w-12 px-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  onBlur={(e) => {
                    if (e.target.value) {
                      handlers.handleChange({
                        target: {
                          name: 'emojis',
                          value: [...safeForm.emojis, e.target.value],
                        },
                      });
                      e.target.value = '';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handlers.handleChange({
                        target: {
                          name: 'emojis',
                          value: [...safeForm.emojis, e.target.value],
                        },
                      });
                      e.target.value = '';
                    }
                  }}
                />
              </>
            ) : (
              safeProfile.emojis.length > 0 && (
                <span className="flex flex-wrap gap-1 text-xl">
                  {safeProfile.emojis.map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}
                </span>
              )
            )}
          </div>
        </div>
        {/* Avatar à direita */}
        <div className="flex-shrink-0 flex flex-col items-center ml-4 pt-4 sm:pt-12">
          <div className="relative">
            <img
              src={
                editing ? avatarPreview || safeForm.avatar : safeProfile.avatar
              }
              alt="Avatar"
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-gray-900 shadow-lg object-cover bg-gray-100 dark:bg-gray-700"
            />
            {editing && (
              <label className="absolute bottom-2 right-2 bg-emerald-600 text-white p-1 rounded-full cursor-pointer hover:bg-emerald-700 shadow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlers.handleAvatarChange}
                  className="hidden"
                  ref={avatarInputRef}
                />
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 16v-4M12 16l4-4M12 16l-4-4" />
                </svg>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
