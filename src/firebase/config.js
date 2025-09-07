import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { setupDevEnvironment, applyCorsFix } from "./devConfig";

// A função de validação continua a mesma, está perfeita.
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

  if (import.meta.env.DEV) {
    console.debug('[OLLO] Variáveis de ambiente Firebase carregadas com sucesso');
  }
}

validateFirebaseEnv();

const firebaseConfig = {
  // CORREÇÃO: Implementando a chave de API condicional para o emulador.
  // Esta é a mudança principal para resolver o erro 400 Bad Request.
  // Quando usamos emuladores, o SDK do Firebase ainda exige uma chave de API não vazia.
  // Fornecer uma chave 'dummy' (fictícia) garante que a requisição seja sempre válida no ambiente de desenvolvimento local.
  apiKey: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
    ? 'ollo-test-api-key' // Pode ser qualquer string não vazia.
    : import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicialização segura (sem alterações aqui)
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('[OLLO] Erro na inicialização do Firebase:', error);
  throw new Error('Falha na configuração do Firebase. Verifique os logs do servidor.');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Conexão com emuladores (sem alterações aqui)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    console.log('[OLLO] Conectando aos emuladores Firebase...');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('[OLLO] Conectado aos emuladores Firebase com sucesso');
  } catch (error) {
    console.error('[OLLO] Erro ao conectar aos emuladores Firebase:', error);
  }
}

// Configurações de desenvolvimento (sem alterações aqui)
if (import.meta.env.DEV) {
  setupDevEnvironment();
  applyCorsFix();
}