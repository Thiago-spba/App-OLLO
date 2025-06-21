// src/firebase/config.js

// 1️⃣ Importa o core do Firebase e os serviços que vamos usar
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Storage para upload de mídia

// 2️⃣ Configuração do seu projeto, via variáveis de ambiente
// ⚠️ Certifique-se de ter um arquivo `.env` na raiz do projeto com todas essas VITE_*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 3️⃣ Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// 4️⃣ Instâncias exportadas para uso em toda a aplicação
export const auth = getAuth(app);           // Autenticação de usuários
export const db = getFirestore(app);        // Firestore para dados estruturados
export const storage = getStorage(app);     // Storage para subir imagens/vídeos

// 5️⃣ Exporta o próprio app caso precise de acesso direto
export default app;

// 📌 Lembrete importante:
// - Verifique no console do Firebase se o Storage está habilitado e com regras de acesso corretas.
// - Em PRODUÇÃO, revise suas regras de Firestore e Storage para garantir segurança.
// - Mantenha seu arquivo `.env` fora do controle de versão (.gitignore).
