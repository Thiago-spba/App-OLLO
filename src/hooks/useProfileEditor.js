// CRIE ESTE NOVO ARQUIVO EM: src/hooks/useProfileEditor.js

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// EXPLICAÇÃO: Este hook encapsula TODA a lógica de edição do perfil.
// Ele recebe os dados iniciais do perfil e retorna o estado atual do formulário,
// o status da edição e todas as funções necessárias para a UI interagir.
export function useProfileEditor(initialProfileData) {
  const { currentUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialProfileData);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ações
  const handleEdit = useCallback(() => {
    setEditing(true);
    setForm(initialProfileData); // Reseta o form para o estado original ao começar a editar
  }, [initialProfileData]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setForm(initialProfileData);
    setAvatarFile(null);
    setCoverFile(null);
  }, [initialProfileData]);

  const handleSave = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');

    try {
      let avatarUrl = form.avatar;
      let coverUrl = form.cover;

      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(avatarRef, avatarFile);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      if (coverFile) {
        const coverRef = ref(storage, `covers/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      const dataToSave = {
        ...form,
        avatar: avatarUrl,
        cover: coverUrl,
      };

      await setDoc(doc(db, 'users', currentUser.uid), dataToSave, { merge: true });
      
      setEditing(false);
      setAvatarFile(null);
      setCoverFile(null);
      setSuccess('Perfil salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);

      // Para garantir que a página reflita 100% os dados do banco,
      // recarregar é a forma mais simples por agora.
      window.location.reload();

    } catch (err) {
      setError('Erro ao salvar o perfil: ' + (err.message || err.code || ''));
      console.error('Erro completo ao salvar perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, form, avatarFile, coverFile]);

  // Handlers para o formulário
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleFileChange = (e, fileSetter, previewKey) => {
    const file = e.target.files?.[0];
    if (file) {
      fileSetter(file);
      setForm((prev) => ({ ...prev, [previewKey]: URL.createObjectURL(file) }));
    }
  };

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialProfileData) || !!avatarFile || !!coverFile,
    [form, initialProfileData, avatarFile, coverFile]
  );

  return {
    editing,
    form,
    loading,
    error,
    success,
    isDirty,
    actions: {
      handleEdit,
      handleCancel,
      handleSave,
    },
    handlers: {
      handleChange,
      handleAvatarChange: (e) => handleFileChange(e, setAvatarFile, 'avatar'),
      handleCoverChange: (e) => handleFileChange(e, setCoverFile, 'cover'),
    },
  };
}