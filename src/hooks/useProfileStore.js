// ARQUIVO: src/hooks/useProfileStore.js

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

// CORREÇÃO: Garantimos que a constante seja exportada.
// A falta da palavra "export" causava o SyntaxError que impedia o funcionamento da página.
export const useProfileStore = create(
  immer((set, get) => ({
    // --- ESTADO ---
    currentUser: null,
    initialProfileData: null,
    form: null,
    editing: false,
    avatarFile: null,
    coverFile: null,
    loading: false,
    success: '',
    error: '',
    _reloadAuthUser: null,

    // --- AÇÕES ---

    setReloadAuthUser: (reloadFn) => set({ _reloadAuthUser: reloadFn }),

    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      const cleanup = (preview) => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      };
      if (type === 'avatar' || !type) {
        cleanup(form.avatarPreview);
      }
      if (type === 'cover' || !type) {
        cleanup(form.coverPreview);
      }
    },

    initialize: (profileData) => {
      const { form } = get();
      const isSameProfile = form?.id === profileData.id;

      const initialForm = {
        ...profileData,
        avatarPreview: null,
        coverPreview: null,
      };
      
      if (isSameProfile) {
        set({ initialProfileData: initialForm });
      } else {
        set({
          initialProfileData: initialForm,
          form: initialForm,
          editing: false,
          avatarFile: null,
          coverFile: null,
          success: '',
          error: '',
        });
      }
    },

    setCurrentUser: (user) => {
      set({ currentUser: user });
    },

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

      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('A imagem é muito grande (máximo 5MB).');
        return;
      }

      get().cleanupPreviews(fileType);
      set((state) => {
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
      const { currentUser, form, avatarFile, coverFile, initialProfileData, _reloadAuthUser } = get();
      
      if (!currentUser || !form) {
        return toast.error('Não foi possível salvar, dados do usuário ausentes.');
      }
      if (!_reloadAuthUser) {
        console.error("Função de recarga do AuthContext não foi injetada no ProfileStore!");
        return toast.error('Erro de configuração. Tente recarregar a página.');
      }

      set({ loading: true, error: '', success: '' });
      const toastId = toast.loading('Salvando perfil...');
      
      try {
        let newAvatarUrl = initialProfileData?.avatarUrl || null;
        let newCoverUrl = initialProfileData?.coverUrl || null;

        const uploadImage = async (file, path) => {
          const imageRef = ref(storage, path);
          await uploadBytes(imageRef, file);
          return await getDownloadURL(imageRef);
        };

        if (avatarFile) {
          newAvatarUrl = await uploadImage(avatarFile, `avatars/${currentUser.uid}/${uuidv4()}`);
        }
        if (coverFile) {
          newCoverUrl = await uploadImage(coverFile, `covers/${currentUser.uid}/${uuidv4()}`);
        }

        const dataToSave = {
          name: form.name,
          bio: form.bio,
          avatarUrl: newAvatarUrl,
          coverUrl: newCoverUrl,
          updatedAt: serverTimestamp(),
        };

        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

        await _reloadAuthUser();

        const updatedProfileData = { ...initialProfileData, ...dataToSave };
        get().cleanupPreviews();
        
        set({
          editing: false,
          success: 'Perfil atualizado com sucesso!',
          initialProfileData: updatedProfileData,
          form: updatedProfileData,
          avatarFile: null,
          coverFile: null,
          error: '',
          loading: false,
        });

        toast.success('Perfil salvo!', { id: toastId });
      } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        set({ error: 'Falha ao salvar o perfil. Tente novamente.', loading: false });
        toast.error('Falha ao salvar.', { id: toastId });
      }
    },
  }))
);