// src/store/authStore.js

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // Este store está intencionalmente vazio por enquanto.
  // Usaremos o AuthContext para gerenciar a autenticação.
}));

export default useAuthStore;
