// src/components/pages/profile/profileEditModal.jsx

import React, { useState } from 'react';
import ProfilePrivacyField from './profilePrivacyField';
import ProfileGallery from './ProfileGallery'; // ✅ novo import da galeria

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { storage } from '../../firebase/config';
import { uploadGalleryMedia } from '../../lib/firebase/uploadGalleryMedia';

const defaultAvatar = '/images/default-avatar.png';
const defaultCover = '/images/default-cover.png';

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
    gallery: profile.gallery || [],
    showGallery: profile.showGallery ?? true,
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleInstantUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uid = profile.uid || profile.id;
      const newItems = await uploadGalleryMedia(files, uid);

      setForm((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newItems],
      }));

      e.target.value = '';
    } catch (err) {
      console.error('Erro ao enviar mídia:', err);
      alert('Erro ao enviar um ou mais arquivos.');
    }
  };

  const handleEmojiAdd = (e) => {
    const emoji = e.target.value.trim();
    if (emoji && !form.emojis.includes(emoji)) {
      setForm((prev) => ({ ...prev, emojis: [...prev.emojis, emoji] }));
      e.target.value = '';
    }
  };

  const handleEmojiRemove = (idx) => {
    setForm((prev) => ({
      ...prev,
      emojis: prev.emojis.filter((_, i) => i !== idx),
    }));
  };

  const toggleVisibility = (field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uid = profile.uid || profile.id;
      if (!uid) throw new Error('ID do usuário não definido');

      const userRef = doc(db, 'users', uid);

      await updateDoc(userRef, {
        avatar: form.avatar,
        cover: form.cover,
        username: form.username,
        realName: form.realName,
        showRealName: form.showRealName,
        location: form.location,
        showLocation: form.showLocation,
        bio: form.bio,
        emojis: form.emojis,
        statusOnline: form.statusOnline,
        showStatusOnline: form.showStatusOnline,
        gallery: form.gallery,
        showGallery: form.showGallery,
        updatedAt: serverTimestamp(),
      });

      if (onSave) onSave({ ...profile, ...form });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Erro ao salvar perfil. Verifique sua conexão ou tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Editar Perfil
        </h2>

        {/* ✅ GALERIA INTEGRADA */}
        <ProfileGallery
          profile={profile}
          editing={true}
          form={form}
          galleryInputRef={{ current: null }} // ajuste se usar useRef
          loading={loadingAvatar || loadingCover}
          handlers={{
            handleInstantUpload,
            toggleVisibility,
            handleRemoveMedia: (id) =>
              setForm((prev) => ({
                ...prev,
                gallery: prev.gallery.filter((item) => item.id !== id),
              })),
          }}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... interface mantida como no original ... */}
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
