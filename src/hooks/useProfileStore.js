// src/hooks/useProfileStore.js - VERSÃO CORRIGIDA

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

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

    // NOVO: Função para carregar dados do perfil do Firestore
    loadProfileData: async (userId) => {
      if (!userId) {
        console.warn('loadProfileData: userId não fornecido');
        return null;
      }

      try {
        set({ loading: true, error: '' });
        
        const userDocRef = doc(db, 'users_public', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          console.log('Dados carregados do Firestore:', profileData);
          
          // Inicializa o formulário com os dados carregados
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
            loading: false,
          });
          
          return profileData;
        } else {
          console.warn('Documento do usuário não encontrado no Firestore');
          set({ loading: false, error: 'Perfil não encontrado' });
          return null;
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        set({ 
          loading: false, 
          error: 'Erro ao carregar dados do perfil' 
        });
        return null;
      }
    },

    // Ações
    initialize: (profileData) => {
      console.log('Inicializando perfil com dados:', profileData);
      
      const initialForm = {
        ...profileData,
        avatarPreview: null,
        coverPreview: null,
      };
      
      // Remove propriedades antigas se existirem
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

    setCurrentUser: (user) => {
      console.log('Definindo usuário atual:', user?.uid);
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
      
      console.log(`Arquivo selecionado para ${fileType}:`, file.name);
      
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
        // Preserva as URLs existentes
        let finalAvatarUrl = initialProfileData?.avatarURL || null;
        let finalCoverUrl = initialProfileData?.coverURL || null;
        
        const uploadImage = async (file, path) => {
          console.log(`Fazendo upload da imagem para: ${path}`);
          const imageRef = ref(storage, path);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          console.log(`Upload concluído. URL: ${url}`);
          return url;
        };
        
        // Upload do avatar se houver arquivo novo
        if (avatarFile) {
          finalAvatarUrl = await uploadImage(avatarFile, `avatars/${currentUser.uid}/${uuidv4()}`);
        }
        
        // Upload da capa se houver arquivo novo
        if (coverFile) {
          finalCoverUrl = await uploadImage(coverFile, `covers/${currentUser.uid}/${uuidv4()}`);
        }
        
        // Prepara os dados para salvar
        const dataToSave = { ...form };
        delete dataToSave.avatarPreview;
        delete dataToSave.coverPreview;
        
        // CORREÇÃO: Mantém consistência nos nomes das propriedades
        dataToSave.avatarURL = finalAvatarUrl;
        dataToSave.coverURL = finalCoverUrl;
        dataToSave.updatedAt = serverTimestamp();
        
        console.log('Dados que serão salvos no Firestore:', dataToSave);
        
        // Salva no Firestore
        const userDocRef = doc(db, 'users_public', currentUser.uid);
        await setDoc(userDocRef, dataToSave, { merge: true });
        
        console.log('Dados salvos com sucesso no Firestore');
        
        // Limpa previews e atualiza estado
        get().cleanupPreviews();
        set((state) => {
          state.editing = false;
          state.success = 'Perfil atualizado com sucesso!';
          state.initialProfileData = dataToSave;
          state.form = dataToSave;
          state.avatarFile = null;
          state.coverFile = null;
          state.error = '';
          state.loading = false;
        });
        
      } catch (err) {
        console.error("Erro ao salvar perfil:", err);
        set({ 
          error: 'Falha ao salvar o perfil. Tente novamente.',
          loading: false
        });
      }
    },
    
    // Função para debugging - mostra o estado atual
    debugState: () => {
      const state = get();
      console.log('Estado atual do ProfileStore:', {
        currentUser: state.currentUser?.uid || 'null',
        hasInitialData: !!state.initialProfileData,
        hasForm: !!state.form,
        editing: state.editing,
        loading: state.loading,
        avatarURL: state.form?.avatarURL || 'null',
        coverURL: state.form?.coverURL || 'null',
      });
    },
    
    handleMediaUpload: async (file) => {
      // Futura implementação da galeria
    },
  }))
);