// ARQUIVO CORRIGIDO: src/stores/useProfileStore.js
// Versão com upload e salvamento funcionando

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
  _reloadAuthUser: null,
};

export const useProfileStore = create(
  immer((set, get) => ({
    ...initialState,

    // --- CONFIGURAÇÃO ---
    setReloadAuthUser: (reloadFn) => {
      console.log('[ProfileStore] Função de reload do auth configurada');
      set({ _reloadAuthUser: reloadFn });
    },

    setCurrentUser: (user) => {
      console.log('[ProfileStore] Usuário atual definido:', user?.uid);
      set({ currentUser: user });
    },

    reset: () => {
      console.log('[ProfileStore] Reset do store executado');
      const state = get();
      state.cleanupPreviews();
      set(initialState);
    },

    // --- LIMPEZA DE PREVIEWS ---
    cleanupPreviews: (type) => {
      const { form } = get();
      if (!form) return;
      
      const cleanup = (preview) => {
        if (preview && preview.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview);
            console.log('[ProfileStore] Preview limpa:', preview.substring(0, 30));
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

    // --- MANIPULAÇÃO DE ARQUIVOS ---
    handleFileChange: (e, fileType) => {
      const file = e.target.files?.[0];
      if (!file) return;

      console.log('[ProfileStore] Arquivo selecionado:', fileType, file.name, file.size);

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

        console.log('[ProfileStore] Preview criado com sucesso para:', fileType);
      } catch (error) {
        console.error('[ProfileStore] Erro ao processar arquivo:', error);
        toast.error('Erro ao processar arquivo.');
      }
    },

    // --- UPLOAD INDIVIDUAL DE IMAGEM ---
    uploadImage: async (file, path) => {
      console.log('[ProfileStore] Iniciando upload:', path);
      
      try {
        const imageRef = ref(storage, path);
        
        // Upload do arquivo
        const uploadResult = await uploadBytes(imageRef, file);
        console.log('[ProfileStore] Upload concluído para:', path);
        
        // Obter URL de download
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log('[ProfileStore] URL obtida:', downloadURL.substring(0, 50) + '...');
        
        return downloadURL;
      } catch (error) {
        console.error('[ProfileStore] Erro no upload:', error);
        
        if (error.code === 'storage/unauthorized') {
          throw new Error('Não autorizado para upload. Verifique suas permissões.');
        } else if (error.code === 'storage/canceled') {
          throw new Error('Upload cancelado.');
        } else if (error.code === 'storage/unknown') {
          throw new Error('Erro desconhecido no upload. Tente novamente.');
        }
        
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
      
      console.log('[ProfileStore] Iniciando salvamento do perfil');
      
      // Validações críticas
      if (!currentUser) {
        console.error('[ProfileStore] Usuário não autenticado');
        return toast.error('Você precisa estar logado para salvar o perfil.');
      }
      
      if (!form) {
        console.error('[ProfileStore] Dados do formulário não disponíveis');
        return toast.error('Dados do formulário não disponíveis.');
      }
      
      if (!_reloadAuthUser) {
        console.error('[ProfileStore] Função de reload não configurada');
        return toast.error('Configuração inválida. Recarregue a página.');
      }

      set({ loading: true, error: '', success: '' });
      const toastId = toast.loading('Salvando perfil...');
      
      try {
        let newAvatarUrl = initialProfileData?.avatarUrl || null;
        let newCoverUrl = initialProfileData?.coverUrl || null;

        // Upload de avatar se selecionado
        if (avatarFile) {
          try {
            console.log('[ProfileStore] Fazendo upload do avatar...');
            const avatarPath = `avatars/${currentUser.uid}/${uuidv4()}.${avatarFile.name.split('.').pop()}`;
            newAvatarUrl = await get().uploadImage(avatarFile, avatarPath);
            console.log('[ProfileStore] Avatar salvo:', newAvatarUrl.substring(0, 50));
          } catch (error) {
            console.error('[ProfileStore] Erro no upload do avatar:', error);
            throw new Error(`Falha no upload do avatar: ${error.message}`);
          }
        }

        // Upload de capa se selecionado
        if (coverFile) {
          try {
            console.log('[ProfileStore] Fazendo upload da capa...');
            const coverPath = `covers/${currentUser.uid}/${uuidv4()}.${coverFile.name.split('.').pop()}`;
            newCoverUrl = await get().uploadImage(coverFile, coverPath);
            console.log('[ProfileStore] Capa salva:', newCoverUrl.substring(0, 50));
          } catch (error) {
            console.error('[ProfileStore] Erro no upload da capa:', error);
            throw new Error(`Falha no upload da capa: ${error.message}`);
          }
        }

        // Preparar dados para salvar
        const dataToSave = {
          name: form.name?.trim() || '',
          bio: form.bio?.trim() || '',
          avatarUrl: newAvatarUrl,
          coverUrl: newCoverUrl,
          updatedAt: serverTimestamp(),
        };

        console.log('[ProfileStore] Salvando no Firestore:', Object.keys(dataToSave));

        // Salvar no Firestore
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });

        console.log('[ProfileStore] Dados salvos no Firestore com sucesso');

        // Recarregar dados do usuário autenticado
        try {
          console.log('[ProfileStore] Recarregando dados do usuário...');
          await _reloadAuthUser();
          console.log('[ProfileStore] Dados do usuário recarregados');
        } catch (reloadError) {
          console.warn('[ProfileStore] Aviso: Erro ao recarregar usuário:', reloadError);
          // Não é crítico, continuar
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
        console.log('[ProfileStore] Salvamento concluído com sucesso');
        
      } catch (error) {
        console.error('[ProfileStore] Erro no salvamento:', error);
        
        let errorMessage = 'Falha ao salvar o perfil. Tente novamente.';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Sem permissão para salvar. Verifique sua autenticação.';
        } else if (error.message?.includes('avatar')) {
          errorMessage = `Erro no upload do avatar: ${error.message}`;
        } else if (error.message?.includes('capa')) {
          errorMessage = `Erro no upload da capa: ${error.message}`;
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

    // --- UPLOAD DE MÍDIA PARA GALERIA ---
    handleMediaUpload: async (file) => {
      const { currentUser, form } = get();
      
      console.log('[ProfileStore] Iniciando upload de mídia para galeria:', file.name);
      
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
        
        console.log('[ProfileStore] Fazendo upload para galeria:', mediaPath);
        
        // Upload para Storage
        const downloadURL = await get().uploadImage(file, mediaPath);
        
        console.log('[ProfileStore] Upload da galeria concluído:', downloadURL.substring(0, 50));
        
        // Preparar dados da mídia
        const mediaData = {
          url: downloadURL,
          type: file.type,
          path: mediaPath,
          privacy: 'public', // Por padrão público
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
        
        toast.success('Mídia adicionada à galeria!');
        
        return {
          id: docRef.id,
          url: downloadURL,
          ...mediaData
        };
        
      } catch (error) {
        console.error('[ProfileStore] Erro no upload de mídia para galeria:', error);
        
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
  }))
);