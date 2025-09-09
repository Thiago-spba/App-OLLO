// ARQUIVO COMPLETO E CORRIGIDO: src/hooks/useProfileStore.js

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

// Estado inicial limpo e consistente
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
  _reloadAuthUser: null,
};

export const useProfileStore = create(
  immer((set, get) => ({
    ...initialState,

    // --- AÇÕES BÁSICAS ---

    reset: () => {
      console.log('[ProfileStore] Reset do store executado');
      const state = get();
      state.cleanupPreviews();
      set(initialState);
    },

    setReloadAuthUser: (reloadFn) => {
      console.log('[ProfileStore] Função de reload do auth configurada');
      set({ _reloadAuthUser: reloadFn });
    },

    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      
      const cleanup = (preview) => {
        if (preview && preview.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview);
            console.log('[ProfileStore] Preview URL limpa:', preview.substring(0, 50));
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

    // --- INICIALIZAÇÃO E CONFIGURAÇÃO ---

    initialize: (profileData) => {
      console.log('[ProfileStore] Inicializando com dados:', profileData?.username);
      
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

        console.log('[ProfileStore] Inicialização concluída com sucesso');
      } catch (error) {
        console.error('[ProfileStore] Erro na inicialização:', error);
        set({ error: 'Erro ao inicializar perfil' });
      }
    },

    setCurrentUser: (user) => {
      console.log('[ProfileStore] Usuário atual definido:', user?.uid);
      set({ currentUser: user });
    },

    // --- AÇÕES DE EDIÇÃO ---

    handleEdit: () => {
      console.log('[ProfileStore] Modo de edição ativado');
      set({ editing: true, error: '', success: '' });
    },

    handleCancel: () => {
      console.log('[ProfileStore] Cancelando edição');
      
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
      console.log('[ProfileStore] Campo alterado:', name, value?.substring(0, 50));
      
      set((state) => {
        if (state.form && name) {
          state.form[name] = value;
        }
      });
    },

    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      console.log('[ProfileStore] Arquivo selecionado:', fileType, file.name, file.size);

      // Validações de arquivo
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

        console.log('[ProfileStore] Preview criado com sucesso para:', fileType);
      } catch (error) {
        console.error('[ProfileStore] Erro ao processar arquivo:', error);
        toast.error('Erro ao processar arquivo.');
      }
    },

    // --- UPLOAD DE MÍDIA (CORRIGIDO) ---
    handleMediaUpload: async (file) => {
      const { currentUser, form } = get();
      
      console.log('[ProfileStore] Iniciando upload de mídia:', file.name);
      
      if (!currentUser) {
        const error = 'Usuário não autenticado para upload';
        console.error('[ProfileStore]', error);
        toast.error('Você precisa estar logado para fazer upload.');
        throw new Error(error);
      }

      try {
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExtension}`;
        const mediaPath = `gallery/${currentUser.uid}/${fileName}`;
        const mediaRef = ref(storage, mediaPath);
        
        console.log('[ProfileStore] Fazendo upload para:', mediaPath);
        
        // Upload para Storage
        await uploadBytes(mediaRef, file);
        const downloadURL = await getDownloadURL(mediaRef);
        
        console.log('[ProfileStore] Upload concluído, URL:', downloadURL.substring(0, 50));
        
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
        
        console.log('[ProfileStore] Mídia salva no Firestore:', docRef.id);
        
        return {
          id: docRef.id,
          url: downloadURL,
          ...mediaData
        };
        
      } catch (error) {
        console.error('[ProfileStore] Erro no upload de mídia:', error);
        
        if (error.code === 'permission-denied') {
          toast.error('Sem permissão para upload. Verifique se está logado.');
        } else if (error.code === 'storage/unauthorized') {
          toast.error('Não autorizado para upload de arquivos.');
        } else {
          toast.error('Erro no upload. Tente novamente.');
        }
        
        throw error;
      }
    },

    // --- SALVAMENTO DE PERFIL (CORRIGIDO) ---
    handleSave: async () => {
      const { 
        currentUser, 
        form, 
        avatarFile, 
        coverFile, 
        initialProfileData, 
        _reloadAuthUser 
      } = get();
      
      console.log('[ProfileStore] Iniciando salvamento do perfil');
      
      // Validações críticas
      if (!currentUser || !form) {
        console.error('[ProfileStore] Dados ausentes para salvamento');
        return toast.error('Não foi possível salvar, dados do usuário ausentes.');
      }
      
      if (!_reloadAuthUser) {
        console.error('[ProfileStore] Função de recarga do AuthContext não configurada');
        return toast.error('Erro de configuração. Tente recarregar a página.');
      }

      set({ loading: true, error: '', success: '' });
      const toastId = toast.loading('Salvando perfil...');
      
      try {
        let newAvatarUrl = initialProfileData?.avatarUrl || null;
        let newCoverUrl = initialProfileData?.coverUrl || null;

        // Função auxiliar para upload de imagem
        const uploadImage = async (file, path) => {
          console.log('[ProfileStore] Fazendo upload de imagem:', path);
          const imageRef = ref(storage, path);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          console.log('[ProfileStore] Upload concluído:', url.substring(0, 50));
          return url;
        };

        // Upload de avatar se necessário
        if (avatarFile) {
          try {
            newAvatarUrl = await uploadImage(
              avatarFile, 
              `avatars/${currentUser.uid}/${uuidv4()}.${avatarFile.name.split('.').pop()}`
            );
          } catch (error) {
            console.error('[ProfileStore] Erro no upload do avatar:', error);
            throw new Error('Falha no upload do avatar');
          }
        }

        // Upload de cover se necessário
        if (coverFile) {
          try {
            newCoverUrl = await uploadImage(
              coverFile, 
              `covers/${currentUser.uid}/${uuidv4()}.${coverFile.name.split('.').pop()}`
            );
          } catch (error) {
            console.error('[ProfileStore] Erro no upload da capa:', error);
            throw new Error('Falha no upload da capa');
          }
        }

        // Preparar dados para salvamento
        const dataToSave = {
          name: form.name?.trim() || '',
          bio: form.bio?.trim() || '',
          avatarUrl: newAvatarUrl,
          coverUrl: newCoverUrl,
          updatedAt: serverTimestamp(),
        };

        console.log('[ProfileStore] Salvando dados no Firestore:', Object.keys(dataToSave));

        // Salvar no Firestore
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

        console.log('[ProfileStore] Dados salvos com sucesso no Firestore');

        // Recarregar dados do usuário
        try {
          await _reloadAuthUser();
          console.log('[ProfileStore] Dados do usuário recarregados');
        } catch (reloadError) {
          console.warn('[ProfileStore] Erro ao recarregar usuário (não crítico):', reloadError);
        }

        // Atualizar estado local
        const updatedProfileData = { 
          ...initialProfileData, 
          ...dataToSave,
          avatarPreview: null,
          coverPreview: null,
        };
        
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
        console.log('[ProfileStore] Salvamento concluído com sucesso');
        
      } catch (error) {
        console.error('[ProfileStore] Erro no salvamento:', error);
        
        let errorMessage = 'Falha ao salvar o perfil. Tente novamente.';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Sem permissão para salvar. Verifique sua autenticação.';
        } else if (error.code === 'storage/unauthorized') {
          errorMessage = 'Não autorizado para upload de imagens.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        set({ 
          error: errorMessage, 
          loading: false 
        });
        
        toast.error(errorMessage, { id: toastId });
      }
    },
  }))
);