// ARQUIVO ATUALIZADO: src/hooks/useProfileStore.js

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// MUDANÇA: A estrutura do store foi "aplainada". O estado e as ações agora estão no mesmo nível.
// Isso segue as melhores práticas do Zustand para simplificar o uso e a seleção de estado/ações nos componentes.
export const useProfileStore = create(
  immer((set, get) => ({
    // --- ESTADO CENTRALIZADO ---
    currentUser: null,
    initialProfileData: null,
    media: [],
    editing: false,
    form: null,
    avatarFile: null,
    coverFile: null,
    loading: false,
    success: '',
    error: '',

    // --- AÇÕES (MÉTODOS PARA MODIFICAR O ESTADO) ---
    // MUDANÇA: As ações foram movidas do objeto aninhado 'actions' para o nível raiz.
    
    setCurrentUser: (user) => set({ currentUser: user }),

    initialize: (profileData, mediaData = []) => {
      set({
        initialProfileData: profileData,
        form: profileData,
        media: mediaData,
        editing: false,
        avatarFile: null,
        coverFile: null,
        success: '',
        error: '',
      });
    },

    handleEdit: () => set({ editing: true }),

    handleCancel: () => {
      console.log('--- [OLLO] Ação handleCancel foi chamada! ---');
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
        // Garante que 'form' não seja nulo antes de tentar atribuir uma propriedade
        if (state.form) {
          state.form[name] = val;
        }
      });
    },

    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      set((state) => {
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
      console.log('--- [OLLO] Ação handleSave foi chamada! ---');
      const { currentUser, form, avatarFile, coverFile } = get();
      if (!currentUser) return;

      set({ loading: true, error: '', success: '' });

      try {
        let finalAvatarUrl = form.avatar;
        let finalCoverUrl = form.cover;

        if (avatarFile) {
          // CORREÇÃO: Usamos um caminho fixo e previsível para o avatar para evitar arquivos órfãos.
          // Isso garante que o usuário tenha apenas uma imagem de avatar, que é substituída a cada upload.
          const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
          await uploadBytes(avatarRef, avatarFile);
          finalAvatarUrl = await getDownloadURL(avatarRef);
        }

        if (coverFile) {
          // CORREÇÃO: O mesmo princípio é aplicado à imagem de capa. Um caminho, um arquivo por usuário.
          const coverRef = ref(storage, `covers/${currentUser.uid}`);
          await uploadBytes(coverRef, coverFile);
          finalCoverUrl = await getDownloadURL(coverRef);
        }

        const dataToSave = { ...form, avatar: finalAvatarUrl, cover: finalCoverUrl };
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        
        // Usamos setDoc com merge:true para criar o documento se não existir, ou atualizar se existir.
        await setDoc(userDocRef, dataToSave, { merge: true });

        set((state) => {
          state.editing = false;
          state.success = 'Perfil atualizado com sucesso!';
          state.initialProfileData = dataToSave;
          state.form = dataToSave;
          state.avatarFile = null;
          state.coverFile = null;
        });
      } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        set({ error: 'Falha ao salvar o perfil. Tente novamente.' });
      } finally {
        set({ loading: false });
      }
    },

    updateMediaPrivacy: async (mediaId, newPrivacy) => {
      const { currentUser } = get();
      if (!currentUser) return;

      set({ loading: true, error: '' });

      try {
        const mediaRef = doc(db, 'users', currentUser.uid, 'media', mediaId);
        await updateDoc(mediaRef, { privacy: newPrivacy });

        set((state) => {
          const mediaToUpdate = state.media.find((item) => item.id === mediaId);
          if (mediaToUpdate) {
            mediaToUpdate.privacy = newPrivacy;
          }
          state.success = 'Privacidade da mídia atualizada!';
        });
      } catch (err) {
        console.error("Erro ao atualizar privacidade:", err);
        set({ error: 'Falha ao atualizar a privacidade da mídia.' });
      } finally {
        set({ loading: false });
      }
    },
    
    // Deixamos estes como placeholders para implementações futuras.
    handleMediaUpload: async (file) => {
        // Lógica de upload para a galeria...
    },

    handleMediaDelete: async (mediaDoc) => {
        // Lógica para apagar mídia da galeria e do storage...
    },
  }))
);