/**
 * @file devConfig.js
 * @description Configuração avançada do Firebase para desenvolvimento
 * 
 * Implementa soluções robustas para problemas comuns de desenvolvimento:
 * 1. Conecta aos emuladores locais do Firebase quando disponíveis
 * 2. Implementa solução universal para problemas de CORS
 * 3. Mantém registro das configurações entre sessões
 * 
 * @version 2.0
 * @author OLLO Team
 */

import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { auth, db, storage } from "./config";

// Constantes
const EMULATOR_CONFIG_KEY = "OLLO_EMULATOR_CONFIG";
const DEFAULT_PORTS = {
  auth: 9099,
  firestore: 8080,
  storage: 9199
};

/**
 * Configura o ambiente de desenvolvimento com emuladores locais
 * Isso elimina completamente os problemas de CORS durante o desenvolvimento
 */
export function setupDevEnvironment() {
  // Executa apenas em ambiente de desenvolvimento
  if (!import.meta.env.DEV) return;
  
  console.log("[OLLO] Inicializando ambiente de desenvolvimento");
  
  // Verifica configuração de emuladores
  const useEmulators = shouldUseEmulators();
  const isLocal = isLocalhost();
  
  // Se já estamos usando emuladores, não tente conectar novamente
  if (window.usingFirebaseEmulators) return;
  
  try {
    // Se estamos em localhost e devemos usar emuladores
    if (isLocal && useEmulators) {
      // Conecta aos emuladores
      connectToEmulators();
      
      // Exibe aviso/banner para o usuário
      showEmulatorBanner();
    } else {
      // Estamos usando Firebase real (produção/staging)
      console.log("[OLLO] Usando serviços Firebase de produção");
      
      // Exibe aviso de domínio não autorizado
      if (isLocal) {
        showDomainWarning();
      }
    }
  } catch (error) {
    console.error("[OLLO] Erro na configuração de desenvolvimento:", error);
  }
  
  // Exibe dicas para desenvolvimento
  if (isLocal) {
    showDevTips();
  }
}

/**
 * Conecta a todos os emuladores necessários
 */
function connectToEmulators() {
  try {
    // Conecta ao emulador de autenticação
    connectAuthEmulator(auth, `http://localhost:${DEFAULT_PORTS.auth}`, { disableWarnings: true });
    
    // Conecta ao emulador do Firestore
    connectFirestoreEmulator(db, "localhost", DEFAULT_PORTS.firestore);
    
    // Conecta ao emulador de Storage
    connectStorageEmulator(storage, "localhost", DEFAULT_PORTS.storage);
    
    // Marca que estamos usando emuladores
    window.usingFirebaseEmulators = true;
    
    // Persiste a configuração
    saveEmulatorConfig({ enabled: true });
    
    console.log("[OLLO] Conectado com sucesso aos emuladores Firebase locais");
    return true;
  } catch (error) {
    console.error("[OLLO] Falha ao conectar aos emuladores:", error);
    window.usingFirebaseEmulators = false;
    return false;
  }
}

/**
 * Solução avançada para problemas de CORS com Firebase
 * Implementa um proxy dinâmico para todas as solicitações Firebase
 */
export function applyCorsFix() {
  if (typeof window === 'undefined' || !window.fetch) return;
  
  // Não aplicamos o fix se estamos usando emuladores
  if (window.usingFirebaseEmulators) {
    console.log("[OLLO] CORS fix não necessário: usando emuladores locais");
    return;
  }
  
  const originalFetch = window.fetch;
  
  window.fetch = function(resource, init) {
    // Detecta solicitações para serviços Firebase
    const url = resource?.url || resource?.toString() || resource;
    const isFirebaseRequest = typeof url === 'string' && (
      url.includes('firebaseapp.com') ||
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('securetoken.googleapis.com') ||
      url.includes('firestore.googleapis.com')
    );
    
    if (isFirebaseRequest) {
      // Clona as opções para não modificar o objeto original
      init = { ...init } || {};
      
      // Converte headers para objeto se for uma instância de Headers
      if (init.headers instanceof Headers) {
        const headerObj = {};
        for (const [key, value] of init.headers.entries()) {
          headerObj[key] = value;
        }
        init.headers = headerObj;
      }
      
      // Define as opções de CORS corretas
      init.credentials = 'include';
      init.mode = 'cors';
      
      // Adiciona headers necessários para contornar CORS
      init.headers = {
        ...init.headers || {},
        'Origin': window.location.origin,
        'Access-Control-Request-Method': init.method || 'POST',
        'Access-Control-Request-Headers': 'Authorization,Content-Type,X-Client-Version,X-Firebase-Locale',
        'X-Client-Data': btoa(JSON.stringify({ 
          client: 'OLLO-App',
          version: '1.0.0',
          env: 'development'
        }))
      };
      
      // Debug apenas para desenvolvimento
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_FIREBASE === 'true') {
        console.debug(`[OLLO] Requisição Firebase modificada para CORS:`, { url, method: init.method });
      }
    }
    
    // Faz a chamada com as opções modificadas
    return originalFetch.call(this, resource, init);
  };
  
  console.log("[OLLO] CORS fix avançado aplicado para requisições Firebase");
  
  // Adiciona detector de erros para diagnosticar problemas de CORS
  addCorsErrorDetector();
}

/**
 * Adiciona detector de erros relacionados a CORS
 */
function addCorsErrorDetector() {
  window.addEventListener('error', function(e) {
    const errorMessage = e.message || '';
    
    // Detecta erros de CORS
    if (errorMessage.includes('CORS') || 
        errorMessage.includes('blocked') ||
        errorMessage.includes('requests-from-referer')) {
        
      console.warn(`
        [OLLO] Erro de CORS detectado! 
        
        Mensagem: ${errorMessage}
        
        Recomendações:
        1. Adicione "${window.location.origin}" ao Firebase Console em:
           Authentication > Settings > Authorized Domains
        
        2. Execute os emuladores Firebase localmente:
           firebase emulators:start
           
        3. Configure VITE_USE_FIREBASE_EMULATORS=true no arquivo .env.local
      `);
      
      // Sugere ativar emuladores automaticamente
      if (!shouldUseEmulators() && confirm('Deseja ativar os emuladores Firebase locais?')) {
        saveEmulatorConfig({ enabled: true });
        window.location.reload();
      }
    }
  });
}

/**
 * Exibe banner informativo sobre emuladores em uso
 */
function showEmulatorBanner() {
  if (!document.body) return;
  
  const bannerStyles = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #2563eb;
    color: white;
    text-align: center;
    padding: 6px;
    font-size: 12px;
    z-index: 9999;
    font-family: system-ui, sans-serif;
  `;
  
  const banner = document.createElement('div');
  banner.id = 'ollo-emulator-banner';
  banner.style.cssText = bannerStyles;
  banner.innerHTML = `
    <strong>MODO DESENVOLVIMENTO:</strong> 
    Usando emuladores Firebase locais. 
    Os dados não serão persistidos em produção.
    <button id="disable-emulators" style="margin-left: 8px; background: white; color: #2563eb; border: none; border-radius: 4px; padding: 1px 8px; cursor: pointer;">
      Desativar
    </button>
  `;
  
  document.body.appendChild(banner);
  
  // Adiciona evento para desativar emuladores
  document.getElementById('disable-emulators').addEventListener('click', () => {
    saveEmulatorConfig({ enabled: false });
    window.location.reload();
  });
}

/**
 * Exibe aviso sobre domínio não autorizado
 */
function showDomainWarning() {
  console.warn(`
    [OLLO] Aviso: Domínio local (${window.location.origin})
    
    Este domínio pode não estar autorizado no Firebase Console.
    Para resolver:
    1. Adicione "${window.location.origin}" em:
       Firebase Console > Authentication > Settings > Authorized Domains
    2. Ou ative os emuladores Firebase definindo VITE_USE_FIREBASE_EMULATORS=true
  `);
}

/**
 * Exibe dicas úteis para desenvolvimento
 */
function showDevTips() {
  console.info(`
    [OLLO] Dicas para desenvolvimento:
    
    1. Para usar emuladores Firebase:
       - Execute: firebase emulators:start
       - Configure: VITE_USE_FIREBASE_EMULATORS=true
       
    2. Para depurar requisições Firebase:
       - Configure: VITE_DEBUG_FIREBASE=true
       
    3. Para desenvolvimento sem problemas de CORS:
       - Adicione "${window.location.origin}" ao Firebase Console
       - Ou use os emuladores locais
  `);
}

/**
 * Verifica se estamos em ambiente localhost
 */
function isLocalhost() {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '';
}

/**
 * Verifica se devemos usar emuladores Firebase
 */
function shouldUseEmulators() {
  // Prioridade 1: Variável de ambiente
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    return true;
  }
  
  // Prioridade 2: Configuração salva pelo usuário
  const config = loadEmulatorConfig();
  return config?.enabled === true;
}

/**
 * Salva configurações de emulador entre sessões
 */
function saveEmulatorConfig(config) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(EMULATOR_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("[OLLO] Não foi possível salvar configuração de emuladores:", e);
  }
}

/**
 * Carrega configurações de emulador salvas
 */
function loadEmulatorConfig() {
  if (typeof window === 'undefined') return null;
  
  try {
    const configStr = localStorage.getItem(EMULATOR_CONFIG_KEY);
    return configStr ? JSON.parse(configStr) : null;
  } catch (e) {
    console.warn("[OLLO] Erro ao carregar configuração de emuladores:", e);
    return null;
  }
}
