// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// SUAS CHAVES (OLLO APP) - Mantidas as originais
const firebaseConfig = {
  apiKey: "AIzaSyDllOADsJ90lXOkV1k2BHMkeGisnkgLmRc",
  authDomain: "olloapp-egl2025.firebaseapp.com",
  projectId: "olloapp-egl2025",
  storageBucket: "olloapp-egl2025.firebasestorage.app",
  messagingSenderId: "336979715437",
  appId: "1:336979715437:web:a4022f282b2ac4777e2664"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Inicializa Auth
const auth = getAuth(app);

// 3. Inicializa Firestore (Banco de Dados)
// MUDANÇA: Usamos a inicialização padrão. O Firebase gerencia o cache offline automaticamente
// sem travar a conexão inicial se as regras de segurança forem estritas.
const db = getFirestore(app);

// 4. Inicializa Storage
const storage = getStorage(app);

// 5. Inicializa Functions (Backend Brasil)
const functions = getFunctions(app, 'southamerica-east1');

export { auth, db, storage, functions };
export default app;