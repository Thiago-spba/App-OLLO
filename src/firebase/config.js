import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validação segura das variáveis de ambiente
function validateFirebaseEnv() {
  const requiredEnvVars = {
    VITE_FIREBASE_API_KEY: 'Chave API Firebase',
    VITE_FIREBASE_AUTH_DOMAIN: 'Domínio de autenticação',
    VITE_FIREBASE_PROJECT_ID: 'ID do projeto',
    VITE_FIREBASE_STORAGE_BUCKET: 'Bucket de storage',
    VITE_FIREBASE_MESSAGING_SENDER_ID: 'Sender ID',
    VITE_FIREBASE_APP_ID: 'ID do app'
  };

  const missingVars = Object.keys(requiredEnvVars).filter(
    key => !import.meta.env[key]
  );

  if (missingVars.length > 0) {
    const errorDetails = missingVars.map(
      key => `${key} (${requiredEnvVars[key]})`
    ).join(', ');
    
    throw new Error(`[OLLO] Configuração Firebase incompleta. Variáveis faltantes: ${errorDetails}`);
  }

  // Debug seguro - apenas em desenvolvimento
  if (import.meta.env.DEV) {
    console.debug('[OLLO] Firebase configurado com sucesso');
  }
}

// Executa a validação imediatamente
validateFirebaseEnv();

// Configuração do Firebase usando variáveis de ambiente por segurança
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicialização segura
let app;
try {
  // Verifica se o app já foi inicializado para evitar erros em Hot Module Reload
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('[OLLO] Erro na inicialização do Firebase:', error);
  throw new Error('Falha na configuração do Firebase. Verifique os logs do servidor.');
}

// Exportação dos serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/*
 * OLLO - Configuração otimizada do Firebase
 * Melhorias implementadas:
 * 1. Remoção do log da chave de API
 * 2. Validação mais descritiva das variáveis
 * 3. Tratamento de erros na inicialização
 * 4. Debug apenas em ambiente de desenvolvimento
 * 5. Mensagens de erro mais informativas
 */