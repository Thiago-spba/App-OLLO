// Este é um arquivo temporário para substituir a configuração do Firebase
// durante o desenvolvimento para evitar problemas de CORS

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDllOADsJ90lXOkV1k2BHMkeGisnkgLmRc",
  authDomain: "olloapp-egl2025.firebaseapp.com",
  projectId: "olloapp-egl2025",
  storageBucket: "olloapp-egl2025.firebasestorage.app",
  messagingSenderId: "336979715437",
  appId: "1:336979715437:web:a4022f282b2ac4777e2664"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Obtém os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configura emuladores para desenvolvimento
if (import.meta.env.DEV) {
  // O uso de emuladores é uma solução, mas requer configuração adicional
  // que pode não estar disponível. Vamos desativar essa parte por enquanto.
  
  // console.log("Usando emuladores do Firebase para desenvolvimento");
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

// Sobrescreve o método fetch nativo para adicionar cabeçalhos CORS necessários
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Adiciona cabeçalhos apenas para requisições Firebase
    if (typeof url === 'string' && (
        url.includes('firebaseapp.com') || 
        url.includes('googleapis.com') ||
        url.includes('firebase')
      )) {
      options.credentials = 'include';
      options.mode = 'cors';
      options.headers = {
        ...(options.headers || {}),
        'Access-Control-Allow-Origin': '*',
        'Origin': window.location.origin
      };
    }
    return originalFetch.call(this, url, options);
  };
  console.log("[OLLO] CORS fix aplicado para requisições Firebase");
}

console.log("[OLLO] Firebase configurado para ambiente de desenvolvimento");

export { auth, db, storage };
