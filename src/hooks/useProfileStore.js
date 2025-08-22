// ARQUIVO REATORADO E RENOMEADO: src/hooks/useProfileStore.js

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db, storage } from '../firebase/config';
import { doc, setDoc, collection, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// EXPLICAÇÃO: Usamos um padrão que separa o estado das ações para maior organização.
// O `set` modifica o estado e o `get` permite ler o estado de dentro de uma ação.
export const useProfileStore = create(
  immer((set, get) => ({
    // --- ESTADO CENTRALIZADO ---
    currentUser: null,
    initialProfileData: null,
    editing: false,
    form: null,
    avatarFile: null,
    coverFile: null,
    loading: false,
    success: '',
    error: '',

    // --- AÇÕES (MÉTODOS PARA MODIFICAR O ESTADO) ---
    actions: {
      // MUDANÇA: Ação para injetar o usuário logado no nosso store.
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Ação para inicializar o store com os dados do perfil a ser exibido.
      initialize: (profileData) => {
        set({
          initialProfileData: profileData,
          form: profileData,
          editing: false, // Garante que sempre começamos no modo de visualização
          success: '',
          error: '',
        });
      },

      handleEdit: () => set({ editing: true }),

      handleCancel: () => {
        set((state) => {
          state.editing = false;
          state.form = state.initialProfileData;
          state.avatarFile = null;
          state.coverFile = null;
        });
      },

      handleChange: (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        set((state) => {
          state.form[name] = val;
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

      // CORREÇÃO: Lógica de salvar completada com upload de avatar e capa.
      handleSave: async () => {
        const { currentUser, form, avatarFile, coverFile } = get();
        if (!currentUser) return;

        set({ loading: true, error: '', success: '' });
        
        try {
          let finalAvatarUrl = form.avatar;
          let finalCoverUrl = form.cover;

          if (avatarFile) {
            const avatarRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
            await uploadBytes(avatarRef, avatarFile);
            finalAvatarUrl = await getDownloadURL(avatarRef);
          }
          if (coverFile) {
            const coverRef = ref(storage, `covers/${currentUser.uid}_${Date.now()}`);
            await uploadBytes(coverRef, coverFile);
            finalCoverUrl = await getDownloadURL(coverRef);
          }
          
          const dataToSave = { ...form, avatar: finalAvatarUrl, cover: finalCoverUrl };
          
          // Assume que estamos salvando na coleção pública
          await setDoc(doc(db, 'users_public', currentUser.uid), dataToSave, { merge: true });

          set((state) => {
            state.editing = false;
            state.success = 'Perfil atualizado!';
            state.initialProfileData = dataToSave; // Atualiza o estado base
            state.form = dataToSave;
            state.avatarFile = null;
            state.coverFile = null;
          });
          // Não vamos mais recarregar a página, a atualização de estado é suficiente.
        } catch (err) {
          console.error("Erro ao salvar perfil:", err);
          set({ error: 'Falha ao salvar o perfil.' });
        } finally {
          set({ loading: false });
        }
      },

      // MUDANÇA: Ações de mídia agora usam get() para acessar o currentUser.
      handleMediaUpload: async (file) => {
        const { currentUser } = get();
        if (!currentUser || !file) return;
        set({ loading: true, error: '' });
        // ... (resto da sua lógica de upload aqui, ela já estava correta) ...
      },

      handleMediaDelete: async (mediaDoc) => {
        const { currentUser } = get();
        if (!currentUser || !mediaDoc?.id || !mediaDoc?.storagePath) return;
        if (!window.confirm("Tem certeza que deseja excluir esta mídia?")) return;
        set({ loading: true, error: '' });
        // ... (resto da sua lógica de deleção aqui, ela já estava correta) ...
      },
    },
  }))
);