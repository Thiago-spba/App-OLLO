import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { setupDevEnvironment, applyCorsFix } from "./devConfig";

// --- 1. VALIDAÇÃO DE AMBIENTE ---
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
    
    // Erro crítico se faltar variável
    throw new Error(`[OLLO] Configuração Firebase incompleta. Variáveis faltantes: ${errorDetails}`);
  }

  if (import.meta.env.DEV) {
    console.debug('[OLLO] Variáveis de ambiente Firebase carregadas com sucesso');
  }
}

// Executa a validação antes de qualquer coisa
validateFirebaseEnv();

// --- 2. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  // CORREÇÃO CRÍTICA: A chave de teste só é usada se estivermos em DEV *E* com emuladores ligados.
  // Em produção (build), import.meta.env.DEV é false, então ele SEMPRE usará a chave real.
  apiKey: (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true')
    ? 'ollo-test-api-key' 
    : import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- 3. INICIALIZAÇÃO SEGURA (SINGLETON) ---
let app;
try {
  // Evita reinicializar se já existir uma instância
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('[OLLO] Erro na inicialização do Firebase:', error);
  throw new Error('Falha na configuração do Firebase. Verifique os logs do servidor.');
}

// Exportação dos serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'southamerica-east1');

// --- 4. CONEXÃO COM EMULADORES (APENAS LOCAL) ---
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

// --- 5. SETUP DE DESENVOLVIMENTO EXTRA ---
if (import.meta.env.DEV) {
  // Assumindo que essas funções lidam com erros se não existirem
  if (typeof setupDevEnvironment === 'function') setupDevEnvironment();
  if (typeof applyCorsFix === 'function') applyCorsFix();
}