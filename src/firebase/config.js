import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// Import para contornar problemas de CORS durante desenvolvimento
import { setupDevEnvironment, applyCorsFix } from "./devConfig";

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
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Configurações adicionais para garantir compatibilidade em diferentes ambientes
  authProviders: ['email', 'google'],
  // Habilitando CORS explicitamente para todas as origens em ambiente de desenvolvimento
  // Esta configuração é ignorada em produção pois será substituída pelas regras do Firebase Hosting
  cors: {
    origin: true,
    credentials: true
  }
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

// Conexão com emuladores Firebase em ambiente de desenvolvimento
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

// Aplica as configurações de desenvolvimento para contornar problemas de CORS
if (import.meta.env.DEV) {
  console.log('[OLLO] Firebase configurado com sucesso');
  setupDevEnvironment();
  applyCorsFix();
}

/*
 * OLLO - Configuração otimizada do Firebase
 * Melhorias implementadas:
 * 1. Remoção do log da chave de API
 * 2. Validação mais descritiva das variáveis
 * 3. Tratamento de erros na inicialização
 * 4. Debug apenas em ambiente de desenvolvimento
 * 5. Mensagens de erro mais informativas
 * 6. Solução para problemas de CORS em ambiente de desenvolvimento
 * 7. Conexão automática com emuladores Firebase quando ativados
 */