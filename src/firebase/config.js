// src/firebase/config.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validação das variáveis de ambiente para evitar bugs difíceis de rastrear
function checkEnvVar(key) {
  if (!import.meta.env[key]) {
    throw new Error(`[OLLO/Firebase] Variável de ambiente não encontrada: ${key}`);
  }
}

// Lista das variáveis obrigatórias
const REQUIRED_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

REQUIRED_ENV.forEach(checkEnvVar);

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicialização protegida para evitar duplicidade em ambientes react hot-reload/SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exportação centralizada
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/*
  OLLO - Configuração única de Firebase para todo o projeto.
  Padrão sênior:
  - Garante que não faltam variáveis obrigatórias.
  - Evita inicialização duplicada do Firebase.
  - Pronto para ambientes DEV e PROD.
*/
