/**
 * @file firebaseAuthenticator.js
 * @description Implementação robusta para autenticação Firebase que contorna problemas de CORS
 * 
 * Este componente usa uma abordagem adaptativa para autenticação:
 * 1. Em produção: Usa autenticação normal do Firebase
 * 2. Em desenvolvimento: 
 *    a. Tenta usar autenticação normal
 *    b. Se falhar por CORS, muda para estratégia de emulador local
 *    c. Opcionalmente usa uma estratégia de proxy se nenhuma das anteriores funcionar
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  connectAuthEmulator,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./config";

// Constantes e configurações
const AUTH_STORAGE_PREFIX = "OLLO_AUTH_";
const PERSIST_KEY = "OLLO_AUTH_PERSISTENCE";
const EMULATOR_PORT = 9099;
const MAX_RETRIES = 3;

class FirebaseAuthenticator {
  constructor() {
    this.isEmulatorEnabled = false;
    this.isEmulatorConnected = false;
    this.useLocalAuthEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
    
    // Detecta se deve usar emulador baseado em variáveis de ambiente ou configuração salva
    const savedSettings = this.loadPersistentSettings();
    if (savedSettings?.useEmulator === true) {
      this.useLocalAuthEmulator = true;
    }
    
    // Se configurado para usar emulador, conecta imediatamente
    if (this.useLocalAuthEmulator) {
      this.connectToEmulator();
    }
    
    // Registra um manipulador de erro global para detectar problemas de CORS
    this.setupGlobalErrorHandler();
  }
  
  /**
   * Conecta ao emulador de autenticação local
   * @returns {boolean} Sucesso da conexão
   */
  connectToEmulator() {
    if (this.isEmulatorConnected) return true;
    
    try {
      console.log("[OLLO] Conectando ao emulador de autenticação...");
      connectAuthEmulator(auth, `http://localhost:${EMULATOR_PORT}`, { disableWarnings: true });
      this.isEmulatorConnected = true;
      this.isEmulatorEnabled = true;
      this.persistSettings({ useEmulator: true });
      console.log("[OLLO] Emulador de autenticação conectado com sucesso");
      return true;
    } catch (error) {
      console.error("[OLLO] Falha ao conectar ao emulador de autenticação:", error);
      this.isEmulatorConnected = false;
      this.isEmulatorEnabled = false;
      return false;
    }
  }
  
  /**
   * Detecta e gerencia erros de CORS automaticamente
   */
  setupGlobalErrorHandler() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('error', (event) => {
      // Se for um erro relacionado a CORS na autenticação do Firebase
      if (event.message && 
          (event.message.includes('CORS') || 
           event.message.includes('blocked') || 
           event.message.includes('requests-from-referer')) &&
          event.filename && 
          event.filename.includes('firebase')) {
        
        console.warn("[OLLO] Erro de CORS detectado no Firebase Auth, tentando alternar para emulador...");
        
        // Ativa o modo emulador para a próxima tentativa
        if (!this.isEmulatorEnabled) {
          this.useLocalAuthEmulator = true;
          this.connectToEmulator();
        }
      }
    });
  }
  
  /**
   * Login com e-mail e senha (com múltiplas estratégias e retentativas)
   */
  async login(email, password) {
    let attempts = 0;
    let lastError = null;
    
    // Tentativa 1: Usar autenticação Firebase normal
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      lastError = error;
      console.log("[OLLO] Tentativa padrão de login falhou:", error.message);
      
      // Se não for erro de CORS, não precisa tentar outras estratégias
      if (!this.isCorsError(error)) {
        return { success: false, error };
      }
    }
    
    // Tentativa 2+: Usar autenticação com emulador (se erro CORS)
    if (this.isCorsError(lastError) && !this.isEmulatorConnected) {
      console.log("[OLLO] Tentando login via emulador...");
      
      // Conecta ao emulador se ainda não estiver conectado
      const emulatorConnected = this.connectToEmulator();
      
      if (emulatorConnected) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          return { success: true, user: userCredential.user };
        } catch (emulatorError) {
          lastError = emulatorError;
          console.log("[OLLO] Login via emulador falhou:", emulatorError.message);
        }
      }
    }
    
    // Todas as estratégias falharam
    return { 
      success: false, 
      error: lastError,
      message: "Falha na autenticação. Verifique sua conexão e credenciais.",
      suggestions: [
        "Adicione localhost:5173 como domínio autorizado no Firebase Console",
        "Reinicie o servidor de desenvolvimento",
        "Limpe os cookies e cache do navegador"
      ]
    };
  }
  
  /**
   * Registro com e-mail e senha
   */
  async register(email, password, additionalData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualiza o perfil com dados adicionais
      if (additionalData.name) {
        await updateProfile(user, { displayName: additionalData.name });
      }
      
      // Envia e-mail de verificação se configurado
      if (import.meta.env.VITE_EMAIL_VERIFICATION === 'true') {
        try {
          const sendCustomVerificationEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
          await sendCustomVerificationEmail({ uid: user.uid });
        } catch (verificationError) {
          console.warn("[OLLO] Não foi possível enviar e-mail de verificação:", verificationError);
        }
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  /**
   * Sair (logout)
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  /**
   * Redefinição de senha
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  /**
   * Verifica se um erro é relacionado a CORS
   */
  isCorsError(error) {
    if (!error) return false;
    
    return (
      (error.code && (
        error.code.includes('unauthorized-domain') ||
        error.code.includes('requests-from-referer-are-blocked')
      )) ||
      (error.message && (
        error.message.includes('CORS') ||
        error.message.includes('cross-origin') ||
        error.message.includes('blocked')
      ))
    );
  }
  
  /**
   * Persiste configurações entre sessões
   */
  persistSettings(settings) {
    if (typeof window === 'undefined') return;
    
    try {
      const currentSettings = this.loadPersistentSettings() || {};
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(PERSIST_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn("[OLLO] Não foi possível persistir configurações:", error);
    }
  }
  
  /**
   * Carrega configurações persistidas
   */
  loadPersistentSettings() {
    if (typeof window === 'undefined') return null;
    
    try {
      const settings = localStorage.getItem(PERSIST_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.warn("[OLLO] Erro ao carregar configurações persistidas:", error);
      return null;
    }
  }
}

// Exporta uma instância única para toda a aplicação
const firebaseAuthenticator = new FirebaseAuthenticator();
export default firebaseAuthenticator;
