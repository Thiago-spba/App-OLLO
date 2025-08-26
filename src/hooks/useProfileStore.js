// ARQUIVO FINAL, COMPLETO E HIGIENIZADO: src/hooks/useProfileStore.js

// ✅ A SEÇÃO DE IMPORTS COMPLETA
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// ✅ A LINHA DE EXPORTAÇÃO CORRETA
// ✅ CORREÇÃO CIRÚRGICA: Removido um caractere de espaço inválido que estava entre "create(" e "immer".
export const useProfileStore = create(
  immer((set, get) => ({
    // Estado
    currentUser: null,
    initialProfileData: null,
    form: null,
    editing: false,
    avatarFile: null,
    coverFile: null,
    loading: false,
    success: '',
    error: '',

    // Ação interna para limpar URLs de preview da memória (evita memory leaks).
    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      const cleanup = (preview) => {
        if (preview) URL.revokeObjectURL(preview);
      };
      if (type === 'avatar') cleanup(form.avatarPreview);
      else if (type === 'cover') cleanup(form.coverPreview);
      else if (!type) {
        cleanup(form.avatarPreview);
        cleanup(form.coverPreview);
      }
    },

    // Ações
    initialize: (profileData) => {
      const initialForm = {
        ...profileData,
        avatarURL: profileData.avatar || null,
        coverURL: profileData.cover || null,
        avatarPreview: null,
        coverPreview: null,
      };
      delete initialForm.avatar;
      delete initialForm.cover;
      set({
        initialProfileData: initialForm,
        form: initialForm,
        editing: false,
        avatarFile: null,
        coverFile: null,
        success: '',
        error: '',
      });
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    handleEdit: () => set({ editing: true }),

    handleCancel: () => {
      get().cleanupPreviews();
      set((state) => {
        state.editing = false;
        state.form = state.initialProfileData;
        state.avatarFile = null;
        state.coverFile = null;
        state.error = '';
        state.success = '';
      });
    },

    handleChange: (e) => {
      const { name, value } = e.target;
      set((state) => {
        if (state.form) state.form[name] = value;
      });
    },

    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;
      get().cleanupPreviews(fileType);
      set((state) => {
        if (!state.form) return;
        const previewUrl = URL.createObjectURL(file);
        if (fileType === 'avatar') {
          state.avatarFile = file;
          state.form.avatarPreview = previewUrl;
        } else if (fileType === 'cover') {
          state.coverFile = file;
          state.form.coverPreview = previewUrl;
        }
      });
    },

    handleSave: async () => {
      const { currentUser, form, avatarFile, coverFile, initialProfileData } = get();
      if (!currentUser || !form) {
        set({ error: 'Dados do usuário ou formulário ausentes.' });
        return;
      }
      set({ loading: true, error: '', success: '' });
      try {
        let finalAvatarUrl = initialProfileData?.avatarURL || null;
        let finalCoverUrl = initialProfileData?.coverURL || null;
        const uploadImage = async (file, path) => {
          const imageRef = ref(storage, path);
          await uploadBytes(imageRef, file);
          return await getDownloadURL(imageRef);
        };
        if (avatarFile) {
          finalAvatarUrl = await uploadImage(avatarFile, `avatars/${currentUser.uid}/${uuidv4()}`);
        }
        if (coverFile) {
          finalCoverUrl = await uploadImage(coverFile, `covers/${currentUser.uid}/${uuidv4()}`);
        }
        const dataToSave = { ...form };
        delete dataToSave.avatarPreview;
        delete dataToSave.coverPreview;
        dataToSave.avatarURL = finalAvatarUrl;
        dataToSave.coverURL = finalCoverUrl;
        dataToSave.updatedAt = serverTimestamp();
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });
        get().cleanupPreviews();
        set((state) => {
          state.editing = false;
          state.success = 'Perfil atualizado com sucesso!';
          state.initialProfileData = dataToSave;
          state.form = dataToSave;
          state.avatarFile = null;
          state.coverFile = null;
          state.error = '';
        });
      } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        set({ error: 'Falha ao salvar o perfil. Tente novamente.' });
      } finally {
        set({ loading: false });
      }
    },
    
    handleMediaUpload: async (file) => {
      // Futura implementação da galeria
    },
    
  }))
);