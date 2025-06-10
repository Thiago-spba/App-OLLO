// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// A única mudança está na linha 'storageBucket'
const firebaseConfig = {
  apiKey: "AIzaSyA2LBsiciRmvrPYOcIxUOt1UEgw2R5cUe4", // Mantenha sua chave real aqui
  authDomain: "ollo-app-e5224.firebaseapp.com",
  projectId: "ollo-app-e5224",
  // 👇👇 ESTA É A LINHA CORRIGIDA 👇👇
  storageBucket: "ollo-app-e5224.firebasestorage.app",
  messagingSenderId: "194763296569",
  appId: "1:194763296569:web:4c8db85f88b235a11322e8"
};

// O resto do arquivo permanece o mesmo
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;