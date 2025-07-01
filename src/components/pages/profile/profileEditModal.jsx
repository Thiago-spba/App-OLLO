import React, { useState } from 'react';
import ProfilePrivacyField from './profilePrivacyField';

const defaultAvatar =
  'https://api.dicebear.com/8.x/identicon/svg?seed=ollo-user';

// Modal simples responsivo, usando Tailwind
const ProfileEditModal = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState({
    avatar: profile.avatar || '',
    username: profile.username || '',
    realName: profile.realName || '',
    showRealName: profile.showRealName ?? true,
    location: profile.location || '',
    showLocation: profile.showLocation ?? true,
    bio: profile.bio || '',
    emojis: profile.emojis || [],
    statusOnline: profile.statusOnline ?? true,
    showStatusOnline: profile.showStatusOnline ?? true,
  });

  // Handler genérico
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler para adicionar/remover emoji
  const handleEmojiAdd = (e) => {
    const emoji = e.target.value.trim();
    if (emoji && !form.emojis.includes(emoji)) {
      setForm((prev) => ({
        ...prev,
        emojis: [...prev.emojis, emoji],
      }));
      e.target.value = '';
    }
  };

  const handleEmojiRemove = (idx) => {
    setForm((prev) => ({
      ...prev,
      emojis: prev.emojis.filter((_, i) => i !== idx),
    }));
  };

  // Handler de upload de avatar (placeholder: armazene depois no Firebase)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Você pode colocar lógica de upload aqui, por enquanto só URL local
      const url = URL.createObjectURL(file);
      handleChange('avatar', url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Chamar função para salvar no Firebase!
    if (onSave) onSave({ ...profile, ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Editar Perfil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={form.avatar || defaultAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-300"
            />
            <label className="cursor-pointer text-sm font-medium text-primary underline">
              Alterar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          {/* Username */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              maxLength={20}
              onChange={(e) => handleChange('username', e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>
          {/* Nome real + privacidade */}
          <ProfilePrivacyField
            label="Nome real"
            value={
              <input
                type="text"
                value={form.realName}
                maxLength={40}
                onChange={(e) => handleChange('realName', e.target.value)}
                className="input input-bordered w-40"
              />
            }
            visible={form.showRealName}
            onToggle={() => handleChange('showRealName', !form.showRealName)}
          />
          {/* Localização + privacidade */}
          <ProfilePrivacyField
            label="Localização"
            value={
              <input
                type="text"
                value={form.location}
                maxLength={30}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input input-bordered w-40"
              />
            }
            visible={form.showLocation}
            onToggle={() => handleChange('showLocation', !form.showLocation)}
          />
          {/* Status online + privacidade */}
          <ProfilePrivacyField
            label="Status online"
            value={
              <span>
                <input
                  type="checkbox"
                  checked={form.statusOnline}
                  onChange={() =>
                    handleChange('statusOnline', !form.statusOnline)
                  }
                  className="mr-2"
                />
                {form.statusOnline ? 'Online' : 'Offline'}
              </span>
            }
            visible={form.showStatusOnline}
            onToggle={() =>
              handleChange('showStatusOnline', !form.showStatusOnline)
            }
          />
          {/* Bio */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              Bio
            </label>
            <textarea
              value={form.bio}
              maxLength={150}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={3}
            />
            <span className="block text-xs text-gray-400">
              {form.bio.length}/150
            </span>
          </div>
          {/* Emojis */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              Emojis de destaque
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {form.emojis.map((emoji, idx) => (
                <span
                  key={idx}
                  className="text-xl border px-1 rounded cursor-pointer"
                  title="Remover emoji"
                  onClick={() => handleEmojiRemove(idx)}
                >
                  {emoji}
                </span>
              ))}
              <input
                type="text"
                placeholder="Adicionar emoji"
                maxLength={2}
                className="input input-bordered w-16"
                onBlur={handleEmojiAdd}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEmojiAdd(e);
                }}
              />
            </div>
          </div>
          {/* Botão salvar */}
          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/80 transition"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
