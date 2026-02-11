// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDllOADsJ90lXOkV1k2BHMkeGisnkgLmRc",
  authDomain: "olloapp-egl2025.firebaseapp.com",
  projectId: "olloapp-egl2025",
  storageBucket: "olloapp-egl2025.firebasestorage.app",
  messagingSenderId: "336979715437",
  appId: "1:336979715437:web:a4022f282b2ac4777e2664"
};

// Inicialização ÚNICA e CENTRALIZADA
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Força a região correta para evitar erro "Internal"
const functions = getFunctions(app, 'southamerica-east1');

export { auth, db, storage, functions };
export default app;