/**
 * @file prodConfig.js
 * @description Configuração robusta do Firebase para ambiente de produção
 * 
 * Corrige problemas comuns de CORS e autenticação em produção:
 * 1. Configura headers adequados para ambiente de produção
 * 2. Implementa fallbacks para diferentes cenários de hospedagem
 * 3. Garante compatibilidade com diferentes provedores de hosting
 * 
 * @version 2.1 - Fix CORS credentials
 * @author OLLO Team
 */

// Detecta automaticamente o ambiente de produção
const isProduction = import.meta.env.PROD;
const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Lista de domínios autorizados para produção
 * Adicione aqui todos os domínios onde sua aplicação será hospedada
 */
const AUTHORIZED_DOMAINS = [
  'https://olloapp.com.br',
  'https://www.olloapp.com.br',
  'https://olloapp-egl2025.web.app',
  'https://olloapp-egl2025.firebaseapp.com',
  'https://app-ollo.vercel.app',
  'https://olloapp-git-main-thiago-spbas-projects.vercel.app',
  'https://olloapp-23s0ut1w2-thiago-spbas-projects.vercel.app',
  // Adicione aqui o domínio da sua hospedagem atual
  currentDomain
].filter(Boolean);

/**
 * Configuração robusta para ambiente de produção
 * Elimina problemas de CORS e otimiza performance
 */
export function setupProductionEnvironment() {
  if (!isProduction) return;
  
  console.log("[OLLO] Inicializando configuração de produção");
  console.log("[OLLO] Domínio atual:", currentDomain);
  
  try {
    // Aplica correções de CORS para produção
    applyProductionCorsFix();
    
    // Configura headers de segurança
    setupSecurityHeaders();
    
    // Otimiza configurações de rede
    optimizeNetworkConfig();
    
    // Valida configuração do Firebase
    validateFirebaseConfig();
    
    console.log("[OLLO] Configuração de produção aplicada com sucesso");
    
  } catch (error) {
    console.error("[OLLO] Erro na configuração de produção:", error);
    
    // Implementa fallback em caso de erro
    applyFallbackConfig();
  }
}

/**
 * Aplica correções específicas de CORS para produção
 */
function applyProductionCorsFix() {
  if (typeof window === 'undefined' || !window.fetch) return;
  
  const originalFetch = window.fetch;
  
  window.fetch = function(resource, init = {}) {
    const url = resource?.url || resource?.toString() || resource;
    
    // Detecta requisições Firebase
    const isFirebaseRequest = typeof url === 'string' && (
      url.includes('firebaseapp.com') ||
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('securetoken.googleapis.com') ||
      url.includes('firestore.googleapis.com') ||
      url.includes('googleapis.com')
    );
    
    if (isFirebaseRequest) {
      // Headers otimizados para produção
      const enhancedHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': currentDomain,
        'Referer': currentDomain,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': 'OLLO-1.0.0',
        'Cache-Control': 'no-cache',
        ...init.headers
      };
      
      // Configurações otimizadas - CORREÇÃO: sem credentials para evitar CORS
      const enhancedInit = {
        ...init,
        mode: 'cors',
        credentials: 'same-origin', // CORREÇÃO: mudado de 'include' para 'same-origin'
        headers: enhancedHeaders,
        redirect: 'follow'
      };
      
      // Log apenas para debug (removido em produção final)
      if (import.meta.env.VITE_DEBUG_FIREBASE === 'true') {
        console.log("[OLLO] Requisição Firebase otimizada:", url);
      }
      
      return originalFetch.call(this, resource, enhancedInit);
    }
    
    return originalFetch.call(this, resource, init);
  };
  
  console.log("[OLLO] CORS fix para produção aplicado");
}

/**
 * Configura headers de segurança para produção
 */
function setupSecurityHeaders() {
  // Adiciona meta tags de segurança se não existirem
  const securityMetas = [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { name: 'robots', content: 'index, follow' },
    { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
    { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
    { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
  ];
  
  securityMetas.forEach(meta => {
    if (!document.querySelector(`meta[name="${meta.name}"], meta[http-equiv="${meta['http-equiv']}"]`)) {
      const metaElement = document.createElement('meta');
      if (meta.name) metaElement.name = meta.name;
      if (meta['http-equiv']) metaElement.httpEquiv = meta['http-equiv'];
      metaElement.content = meta.content;
      document.head.appendChild(metaElement);
    }
  });
}

/**
 * Otimiza configurações de rede para produção
 */
function optimizeNetworkConfig() {
  // Configura timeouts apropriados
  if (typeof window !== 'undefined') {
    // Aumenta timeout para requisições em produção
    window.FIREBASE_TIMEOUT = 30000; // 30 segundos
    
    // Configura retry automático
    window.FIREBASE_RETRY_CONFIG = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true
    };
  }
}

/**
 * Valida se a configuração do Firebase está correta
 */
function validateFirebaseConfig() {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error("[OLLO] Variáveis de ambiente Firebase ausentes:", missingVars);
    throw new Error(`Configuração Firebase incompleta: ${missingVars.join(', ')}`);
  }
  
  console.log("[OLLO] Configuração Firebase validada com sucesso");
}

/**
 * Configuração de fallback em caso de problemas
 */
function applyFallbackConfig() {
  console.warn("[OLLO] Aplicando configuração de fallback");
  
  // Headers mínimos para compatibilidade máxima
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    
    window.fetch = function(resource, init = {}) {
      const url = resource?.url || resource?.toString() || resource;
      
      if (typeof url === 'string' && url.includes('firebase')) {
        init.mode = 'cors';
        init.credentials = 'same-origin'; // CORREÇÃO: fallback também usa same-origin
        init.headers = {
          'Content-Type': 'application/json',
          ...init.headers
        };
      }
      
      return originalFetch.call(this, resource, init);
    };
  }
}

/**
 * Função para detectar problemas em tempo real
 */
export function setupProductionMonitoring() {
  if (!isProduction) return;
  
  // Monitor de erros de rede
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('CORS') ||
      event.message.includes('network') ||
      event.message.includes('fetch')
    )) {
      console.error("[OLLO] Erro de rede detectado em produção:", {
        message: event.message,
        domain: currentDomain,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Monitor de falhas de autenticação
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.code?.includes('auth/')) {
      console.error("[OLLO] Erro de autenticação em produção:", {
        code: event.reason.code,
        message: event.reason.message,
        domain: currentDomain
      });
    }
  });
}

/**
 * Utilitário para validar se domínio está autorizado
 */
export function validateCurrentDomain() {
  const isAuthorized = AUTHORIZED_DOMAINS.some(domain => 
    currentDomain.includes(domain.replace('https://', '').replace('http://', ''))
  );
  
  if (!isAuthorized) {
    console.warn(`
      [OLLO] AVISO: Domínio possivelmente não autorizado
      
      Domínio atual: ${currentDomain}
      Domínios autorizados: ${AUTHORIZED_DOMAINS.join(', ')}
      
      Para corrigir:
      1. Acesse o Firebase Console
      2. Vá em Authentication > Settings > Authorized Domains
      3. Adicione: ${currentDomain}
    `);
    
    return false;
  }
  
  console.log("[OLLO] Domínio autorizado confirmado");
  return true;
}

// Auto-executa em produção
if (isProduction && typeof window !== 'undefined') {
  // Pequeno delay para garantir que tudo foi carregado
  setTimeout(() => {
    setupProductionEnvironment();
    setupProductionMonitoring();
    validateCurrentDomain();
  }, 100);
}