// ARQUIVO: src/hooks/useProfileStore.js

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

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

    // --- AÇÕES ---

    // Ação interna para limpar URLs de preview da memória
    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      const cleanup = (preview) => {
        if (preview) URL.revokeObjectURL(preview);
      };

      if (type === 'avatar' || !type) {
        cleanup(form.avatarPreview);
      }
      if (type === 'cover' || !type) {
        cleanup(form.coverPreview);
      }
    },
    
    // Inicializa o store com os dados do perfil buscados na página
    initialize: (profileData) => {
      const initialForm = {
        ...profileData,
        avatarPreview: null,
        coverPreview: null,
      };
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

    setCurrentUser: (user) => {
      set({ currentUser: user });
    },

    handleEdit: () => set({ editing: true }),

    handleCancel: () => {
      get().cleanupPreviews();
      set((state) => {
        state.editing = false;
        state.form = state.initialProfileData; // Restaura para o estado inicial
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

    // MUDANÇA: Implementação da lógica de preview de arquivos
    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validação básica do arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('A imagem é muito grande (máximo 5MB).');
        return;
      }

      get().cleanupPreviews(fileType); // Limpa o preview anterior se houver

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

    // MUDANÇA: Implementação completa da lógica para salvar o perfil
    handleSave: async () => {
      const { currentUser, form, avatarFile, coverFile, initialProfileData } = get();
      if (!currentUser || !form) {
        return toast.error('Não foi possível salvar, dados do usuário ausentes.');
      }

      set({ loading: true, error: '', success: '' });
      const toastId = toast.loading('Salvando perfil...');

      try {
        let newAvatarURL = initialProfileData?.avatarURL || null;
        let newCoverURL = initialProfileData?.coverURL || null;

        // Função auxiliar para upload
        const uploadImage = async (file, path) => {
          const imageRef = ref(storage, path);
          await uploadBytes(imageRef, file);
          return await getDownloadURL(imageRef);
        };

        // Se um novo avatar foi selecionado, faz o upload
        if (avatarFile) {
          newAvatarURL = await uploadImage(avatarFile, `avatars/${currentUser.uid}/${uuidv4()}`);
        }

        // Se uma nova capa foi selecionada, faz o upload
        if (coverFile) {
          newCoverURL = await uploadImage(coverFile, `covers/${currentUser.uid}/${uuidv4()}`);
        }

        // Prepara o objeto de dados a ser salvo no Firestore
        const dataToSave = {
          name: form.name,
          bio: form.bio,
          // Mantém o resto dos dados do perfil intactos
          ...initialProfileData,
          avatarURL: newAvatarURL,
          coverURL: newCoverURL,
          updatedAt: serverTimestamp(),
        };

        // Remove os previews locais antes de salvar
        delete dataToSave.avatarPreview;
        delete dataToSave.coverPreview;

        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

        // Atualiza o estado da loja com os novos dados
        get().cleanupPreviews();
        set({
          editing: false,
          success: 'Perfil atualizado com sucesso!',
          initialProfileData: dataToSave,
          form: dataToSave,
          avatarFile: null,
          coverFile: null,
          error: '',
          loading: false,
        });

        toast.success('Perfil salvo!', { id: toastId });

      } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        set({
          error: 'Falha ao salvar o perfil. Tente novamente.',
          loading: false
        });
        toast.error('Falha ao salvar.', { id: toastId });
      }
    },
  }))
);