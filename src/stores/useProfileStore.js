// ARQUIVO: src/stores/useProfileStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

// Estado inicial limpo
const initialState = {
  currentUser: null,
  initialProfileData: null,
  form: null,
  editing: false,
  avatarFile: null,
  coverFile: null,
  loading: false,
  success: '',
  error: '',
  _reloadAuthUser: null, // Função para recarregar usuário sem loop
};

export const useProfileStore = create(
  immer((set, get) => ({
    ...initialState,

    // --- CONFIGURAÇÃO ---
    setReloadAuthUser: (reloadFn) => {
      set({ _reloadAuthUser: reloadFn });
    },

    setCurrentUser: (user) => {
      set({ currentUser: user });
    },

    reset: () => {
      const state = get();
      state.cleanupPreviews();
      set(initialState);
    },

    // --- LIMPEZA DE PREVIEWS (Gerenciamento de Memória) ---
    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      
      const cleanup = (preview) => {
        if (preview && preview.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview);
          } catch (error) {
            console.warn('[ProfileStore] Erro ao limpar preview:', error);
          }
        }
      };

      if (type === 'avatar' || !type) {
        cleanup(form.avatarPreview);
      }
      if (type === 'cover' || !type) {
        cleanup(form.coverPreview);
      }
    },

    // --- INICIALIZAÇÃO ---
    initialize: (profileData) => {
      try {
        get().cleanupPreviews();
        
        const safeProfileData = {
          id: profileData?.id || '',
          name: profileData?.name || '',
          username: profileData?.username || '',
          bio: profileData?.bio || '',
          avatarUrl: profileData?.avatarUrl || '',
          coverUrl: profileData?.coverUrl || '',
          verified: profileData?.verified || false,
          createdAt: profileData?.createdAt || null,
          ...profileData,
        };

        const initialForm = {
          ...safeProfileData,
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
          loading: false,
        });
      } catch (error) {
        console.error('[ProfileStore] Erro na inicialização:', error);
        set({ error: 'Erro ao inicializar perfil' });
      }
    },

    // --- AÇÕES DE EDIÇÃO ---
    handleEdit: () => {
      set({ editing: true, error: '', success: '' });
    },

    handleCancel: () => {
      try {
        get().cleanupPreviews();
        set((state) => {
          state.editing = false;
          state.form = { ...state.initialProfileData };
          state.avatarFile = null;
          state.coverFile = null;
          state.error = '';
          state.success = '';
        });
      } catch (error) {
        console.error('[ProfileStore] Erro ao cancelar edição:', error);
      }
    },

    handleChange: (e) => {
      if (!e?.target) return;
      
      const { name, value } = e.target;
      
      set((state) => {
        if (state.form && name) {
          state.form[name] = value;
        }
      });
    },

    // --- MANIPULAÇÃO DE ARQUIVOS ---
    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validações
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem é muito grande (máximo 5MB).');
        return;
      }

      try {
        get().cleanupPreviews(fileType);
        
        set((state) => {
          const previewUrl = URL.createObjectURL(file);
          
          if (fileType === 'avatar') {
            state.avatarFile = file;
            if (state.form) state.form.avatarPreview = previewUrl;
          } else if (fileType === 'cover') {
            state.coverFile = file;
            if (state.form) state.form.coverPreview = previewUrl;
          }
        });
      } catch (error) {
        console.error('[ProfileStore] Erro ao processar arquivo:', error);
        toast.error('Erro ao processar arquivo.');
      }
    },

    // --- UPLOAD INDIVIDUAL DE IMAGEM ---
    uploadImage: async (file, path) => {
      try {
        const imageRef = ref(storage, path);
        const uploadResult = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        return downloadURL;
      } catch (error) {
        console.error('[ProfileStore] Erro no upload:', error);
        throw error;
      }
    },

    // --- SALVAMENTO PRINCIPAL ---
    handleSave: async () => {
      const { 
        currentUser, 
        form, 
        avatarFile, 
        coverFile, 
        initialProfileData, 
        _reloadAuthUser 
      } = get();
      
      // Validações críticas
      if (!currentUser) {
        return toast.error('Você precisa estar logado para salvar o perfil.');
      }
      
      if (!form) {
        return toast.error('Dados do formulário não disponíveis.');
      }
      
      if (!_reloadAuthUser) {
        return toast.error('Configuração inválida. Recarregue a página.');
      }

      set({ loading: true, error: '', success: '' });
      const toastId = toast.loading('Salvando perfil...');
      
      try {
        let newAvatarUrl = initialProfileData?.avatarUrl || null;
        let newCoverUrl = initialProfileData?.coverUrl || null;

        // Upload de avatar se selecionado
        if (avatarFile) {
          const avatarPath = `avatars/${currentUser.uid}/${uuidv4()}.${avatarFile.name.split('.').pop()}`;
          newAvatarUrl = await get().uploadImage(avatarFile, avatarPath);
        }

        // Upload de capa se selecionado
        if (coverFile) {
          const coverPath = `covers/${currentUser.uid}/${uuidv4()}.${coverFile.name.split('.').pop()}`;
          newCoverUrl = await get().uploadImage(coverFile, coverPath);
        }

        // Preparar dados para salvar
        const dataToSave = {
          name: form.name?.trim() || '',
          bio: form.bio?.trim() || '',
          avatarUrl: newAvatarUrl,
          coverUrl: newCoverUrl,
          updatedAt: serverTimestamp(),
        };

        // Salvar no Firestore
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

        // Tenta atualizar o Auth User para refletir mudanças se necessário
        try {
          await _reloadAuthUser();
        } catch (reloadError) {
          console.warn('[ProfileStore] Aviso: Erro não-crítico ao recarregar usuário:', reloadError);
        }

        // Atualizar estado local com dados salvos
        const updatedProfileData = { 
          ...initialProfileData, 
          ...dataToSave,
          avatarPreview: null,
          coverPreview: null,
        };
        
        // Limpar previews e arquivos
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

        toast.success('Perfil salvo com sucesso!', { id: toastId });
        
      } catch (error) {
        console.error('[ProfileStore] Erro no salvamento:', error);
        set({ error: error.message, loading: false });
        toast.error('Erro ao salvar perfil.', { id: toastId });
      }
    },

    // --- UPLOAD DE MÍDIA PARA GALERIA ---
    handleMediaUpload: async (file) => {
      const { currentUser, form } = get();
      
      if (!currentUser) {
        toast.error('Você precisa estar logado para fazer upload.');
        throw new Error('Usuário não autenticado');
      }

      try {
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExtension}`;
        const mediaPath = `gallery/${currentUser.uid}/${fileName}`;
        
        // Upload para Storage
        const downloadURL = await get().uploadImage(file, mediaPath);
        
        // Preparar dados da mídia
        const mediaData = {
          url: downloadURL,
          type: file.type,
          path: mediaPath,
          privacy: 'public',
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          username: form?.username || 'unknown',
          fileName: file.name,
          size: file.size,
        };
        
        // Salvar metadados no Firestore
        const mediaCollectionRef = collection(db, 'users_public', currentUser.uid, 'media');
        const docRef = await addDoc(mediaCollectionRef, mediaData);
        
        toast.success('Mídia adicionada à galeria!');
        
        return {
          id: docRef.id,
          url: downloadURL,
          ...mediaData
        };
        
      } catch (error) {
        console.error('[ProfileStore] Erro no upload de mídia:', error);
        toast.error('Erro no upload. Tente novamente.');
        throw error;
      }
    },
  }))
);