import React, { useState } from 'react';
import ProfilePrivacyField from './profilePrivacyField';

// ADICIONE O IMPORT DO FIREBASE STORAGE E OS MÉTODOS
import { storage } from '../../firebase/config'; // Ajuste para o caminho correto!
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const defaultAvatar =
  'https://api.dicebear.com/8.x/identicon/svg?seed=ollo-user';
const defaultCover =
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=cover&w=500&q=80';

const ProfileEditModal = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState({
    avatar: profile.avatar || '',
    cover: profile.cover || '',
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

  // Novo estado para preview de capa/avatar
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Handler genérico
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler de upload de avatar REAL (salva no Firebase)
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAvatar(true);
    try {
      const avatarRef = ref(
        storage,
        `avatars/${profile.uid || profile.id || 'temp'}_${Date.now()}`
      );
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      setForm((prev) => ({ ...prev, avatar: url }));
      setAvatarPreview(url);
    } catch (err) {
      alert('Erro ao enviar avatar!');
    }
    setLoadingAvatar(false);
  };

  // Handler de upload de CAPA REAL (salva no Firebase)
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingCover(true);
    try {
      const coverRef = ref(
        storage,
        `covers/${profile.uid || profile.id || 'temp'}_${Date.now()}`
      );
      await uploadBytes(coverRef, file);
      const url = await getDownloadURL(coverRef);
      setForm((prev) => ({ ...prev, cover: url }));
      setCoverPreview(url);
    } catch (err) {
      alert('Erro ao enviar capa!');
    }
    setLoadingCover(false);
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

  // Alterna privacidade dos campos
  const toggleVisibility = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Submit final
  const handleSubmit = (e) => {
    e.preventDefault();
    // Chama função externa para salvar (Firestore ou API)
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
          {/* Capa */}
          <div className="mb-2">
            <div className="relative w-full h-32 rounded-xl overflow-hidden mb-1 bg-gray-200 dark:bg-gray-800">
              <img
                src={coverPreview || form.cover || defaultCover}
                alt="Capa"
                className="w-full h-full object-cover"
              />
              <label className="absolute bottom-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-lg shadow cursor-pointer hover:bg-emerald-700 text-sm">
                {loadingCover ? 'Enviando...' : 'Trocar capa'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                  disabled={loadingCover}
                />
              </label>
            </div>
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={avatarPreview || form.avatar || defaultAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-300"
            />
            <label className="cursor-pointer text-sm font-medium text-primary underline">
              {loadingAvatar ? 'Enviando...' : 'Alterar foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={loadingAvatar}
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
            onToggle={() => toggleVisibility('showRealName')}
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
            onToggle={() => toggleVisibility('showLocation')}
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
            onToggle={() => toggleVisibility('showStatusOnline')}
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
            disabled={loadingAvatar || loadingCover}
          >
            {loadingAvatar || loadingCover
              ? 'Salvando...'
              : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
