// ARQUIVO FINAL E COMPLETO (COM UPLOAD DE GALERIA): src/hooks/useProfileStore.js

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Precisamos de IDs únicos para a mídia

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

    // Ações
    initialize: (profileData) => {
      set({
        initialProfileData: profileData,
        form: profileData,
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
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;
      set((state) => {
        if (state.form) {
          state.form[name] = val;
        }
      });
    },

    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      set((state) => {
        if (!state.form) return;
        if (fileType === 'avatar') {
          state.avatarFile = file;
          state.form.avatar = URL.createObjectURL(file);
        } else if (fileType === 'cover') {
          state.coverFile = file;
          state.form.cover = URL.createObjectURL(file);
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
        let finalAvatarUrl = initialProfileData?.avatar || null;
        let finalCoverUrl = initialProfileData?.cover || null;

        if (avatarFile) {
          const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
          await uploadBytes(avatarRef, avatarFile);
          finalAvatarUrl = await getDownloadURL(avatarRef);
        }

        if (coverFile) {
          const coverRef = ref(storage, `covers/${currentUser.uid}`);
          await uploadBytes(coverRef, coverFile);
          finalCoverUrl = await getDownloadURL(coverRef);
        }

        const dataToSave = {
          ...initialProfileData,
          ...form,
          avatar: finalAvatarUrl,
          cover: finalCoverUrl,
        };

        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

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
        set({ error: 'Falha ao salvar o perfil. Verifique as regras de segurança.' });
      } finally {
        set({ loading: false });
      }
    },
    
    // ✅ AÇÃO DE UPLOAD DE MÍDIA PARA A GALERIA
    handleMediaUpload: async (file) => {
      const { currentUser } = get();
      if (!currentUser || !file) {
        set({ error: 'Usuário não autenticado ou arquivo não selecionado.' });
        return;
      }
      set({ loading: true, success: '', error: '' });

      const mediaId = uuidv4(); // Gera um ID único para o arquivo
      const mediaRef = ref(storage, `users/${currentUser.uid}/media/${mediaId}`);

      try {
        await uploadBytes(mediaRef, file);
        const url = await getDownloadURL(mediaRef);
        
        const mediaDocRef = doc(db, 'users', currentUser.uid, 'media', mediaId);
        
        // Salva as informações da mídia no Firestore
        await setDoc(mediaDocRef, {
            url: url,
            type: file.type,
            createdAt: serverTimestamp(),
            privacy: 'public' // Ou 'private', como padrão
        });

        set({ success: 'Mídia adicionada com sucesso!', loading: false });

      } catch(err) {
          console.error("Erro ao fazer upload da mídia:", err);
          set({ error: 'Falha ao adicionar mídia. Verifique as regras de segurança.', loading: false });
      }
    },
  }))
);