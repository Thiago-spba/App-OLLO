import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Voltamos para o import simples
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// ===============================================================
// SUAS CHAVES (OLLO APP)
// ===============================================================
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
// MUDANÇA CRÍTICA: Removemos o cache complexo. 
// Usar apenas getFirestore(app) resolve o erro de "Client Offline".
const db = getFirestore(app);

// 4. Inicializa Storage
const storage = getStorage(app);

// 5. Inicializa Functions (Backend Brasil)
const functions = getFunctions(app, 'southamerica-east1');

export { auth, db, storage, functions };
export default app;