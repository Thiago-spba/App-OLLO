// src/utils/cacheService.js
/**
 * Serviço de cache inteligente para o App OLLO
 * Melhora desempenho, reduz chamadas ao Firestore e proporciona melhor UX
 */

// Configurações do cache
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos em milissegundos
const LONGER_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

// Cache in-memory para dados frequentemente acessados
const memoryCache = {
  data: new Map(),
  
  /**
   * Verifica se um item está no cache e ainda é válido
   * @param {string} key - Chave do cache
   * @returns {boolean} - Se o item existe e é válido
   */
  has(key) {
    if (!this.data.has(key)) return false;
    
    const cachedItem = this.data.get(key);
    const now = Date.now();
    
    // Verifica se o item expirou
    if (now > cachedItem.expiresAt) {
      this.data.delete(key); // Remove item expirado
      return false;
    }
    
    return true;
  },
  
  /**
   * Obtém um item do cache
   * @param {string} key - Chave do cache
   * @returns {any} - Valor armazenado ou null se não existir
   */
  get(key) {
    if (!this.has(key)) return null;
    
    const cachedItem = this.data.get(key);
    return cachedItem.value;
  },
  
  /**
   * Armazena um item no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em milissegundos
   */
  set(key, value, ttl = DEFAULT_TTL) {
    const expiresAt = Date.now() + ttl;
    this.data.set(key, { value, expiresAt });
  },
  
  /**
   * Remove um item do cache
   * @param {string} key - Chave do cache
   */
  delete(key) {
    this.data.delete(key);
  },
  
  /**
   * Limpa todo o cache
   */
  clear() {
    this.data.clear();
  },
  
  /**
   * Limpa cache com base em um prefixo
   * @param {string} prefix - Prefixo da chave
   */
  invalidateByPrefix(prefix) {
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix)) {
        this.data.delete(key);
      }
    }
  }
};

// Cache baseado em localStorage com proteção contra erros
const storageCache = {
  /**
   * Verifica se um item está no localStorage e ainda é válido
   * @param {string} key - Chave do cache
   * @returns {boolean} - Se o item existe e é válido
   */
  has(key) {
    try {
      const cacheKey = `ollo_cache_${key}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return false;
      
      const parsedData = JSON.parse(cachedData);
      const now = Date.now();
      
      // Verifica se o item expirou
      if (now > parsedData.expiresAt) {
        localStorage.removeItem(cacheKey); // Remove item expirado
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Erro ao verificar cache localStorage:', error);
      return false;
    }
  },
  
  /**
   * Obtém um item do localStorage
   * @param {string} key - Chave do cache
   * @returns {any} - Valor armazenado ou null se não existir
   */
  get(key) {
    try {
      if (!this.has(key)) return null;
      
      const cacheKey = `ollo_cache_${key}`;
      const cachedData = localStorage.getItem(cacheKey);
      const parsedData = JSON.parse(cachedData);
      
      return parsedData.value;
    } catch (error) {
      console.warn('Erro ao obter cache do localStorage:', error);
      return null;
    }
  },
  
  /**
   * Armazena um item no localStorage
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em milissegundos
   */
  set(key, value, ttl = LONGER_TTL) {
    try {
      const cacheKey = `ollo_cache_${key}`;
      const expiresAt = Date.now() + ttl;
      const dataToStore = JSON.stringify({ value, expiresAt });
      
      localStorage.setItem(cacheKey, dataToStore);
    } catch (error) {
      console.warn('Erro ao armazenar cache no localStorage:', error);
      // Se localStorage estiver cheio, limpe itens antigos
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldest(5); // Limpa os 5 itens mais antigos
      }
    }
  },
  
  /**
   * Remove um item do localStorage
   * @param {string} key - Chave do cache
   */
  delete(key) {
    try {
      const cacheKey = `ollo_cache_${key}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Erro ao remover cache do localStorage:', error);
    }
  },
  
  /**
   * Limpa todo o cache do localStorage
   */
  clear() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ollo_cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro ao limpar cache do localStorage:', error);
    }
  },
  
  /**
   * Limpa os itens mais antigos do cache
   * @param {number} count - Número de itens a serem limpos
   */
  clearOldest(count) {
    try {
      const cacheItems = [];
      
      // Coleta todos os itens de cache
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ollo_cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            cacheItems.push({ key, expiresAt: item.expiresAt });
          } catch (e) {
            // Se não conseguir analisar, apenas adiciona o item
            cacheItems.push({ key, expiresAt: 0 });
          }
        }
      }
      
      // Ordena por data de expiração (mais antigos primeiro)
      cacheItems.sort((a, b) => a.expiresAt - b.expiresAt);
      
      // Remove os mais antigos
      cacheItems.slice(0, count).forEach(item => {
        localStorage.removeItem(item.key);
      });
    } catch (error) {
      console.warn('Erro ao limpar itens antigos do cache:', error);
    }
  }
};

// API pública para uso nos componentes
const cacheService = {
  /**
   * Obtém um valor do cache, buscando primeiro na memória e depois no localStorage
   * @param {string} key - Chave do cache
   * @returns {any} - Valor do cache ou null
   */
  get(key) {
    // Tenta primeiro do cache em memória (mais rápido)
    const memValue = memoryCache.get(key);
    if (memValue !== null) return memValue;
    
    // Se não encontrar, busca no localStorage
    const storageValue = storageCache.get(key);
    if (storageValue !== null) {
      // Coloca no cache em memória para acesso mais rápido na próxima vez
      memoryCache.set(key, storageValue);
      return storageValue;
    }
    
    return null;
  },
  
  /**
   * Armazena um valor no cache (memória e localStorage)
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {Object} options - Opções de cache
   * @param {boolean} options.memoryOnly - Se true, armazena apenas na memória
   * @param {number} options.ttl - Tempo de vida em milissegundos
   */
  set(key, value, options = {}) {
    const { memoryOnly = false, ttl = DEFAULT_TTL } = options;
    
    // Sempre armazena em memória
    memoryCache.set(key, value, ttl);
    
    // Armazena também no localStorage, a menos que seja memoryOnly
    if (!memoryOnly) {
      storageCache.set(key, value, ttl);
    }
  },
  
  /**
   * Remove um item do cache (memória e localStorage)
   * @param {string} key - Chave do cache
   */
  invalidate(key) {
    memoryCache.delete(key);
    storageCache.delete(key);
  },
  
  /**
   * Invalida todos os itens de cache que começam com um prefixo
   * @param {string} prefix - Prefixo da chave
   */
  invalidateByPrefix(prefix) {
    // Limpa da memória
    memoryCache.invalidateByPrefix(prefix);
    
    // Limpa do localStorage
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`ollo_cache_${prefix}`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erro ao invalidar cache por prefixo:', error);
    }
  },
  
  /**
   * Limpa todo o cache (memória e localStorage)
   */
  clearAll() {
    memoryCache.clear();
    storageCache.clear();
  }
};

export default cacheService;
