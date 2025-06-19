// ARQUIVO PARA SUBSTITUIR: src/firebase/config.js
// Versão atualizada para incluir o Firebase Storage

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Importa a função do Storage

// Sua configuração com variáveis de ambiente (está correto)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Cria e exporta as instâncias de todos os serviços que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 2. Cria e exporta a instância do Storage

export default app;