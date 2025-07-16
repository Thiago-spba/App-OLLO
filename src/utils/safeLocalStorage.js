// src/utils/safeLocalStorage.js

/**
 * Obtém um item do localStorage de forma segura.
 * @param {string} key
 * @returns {string|null}
 */
export function safeGetItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (error) {
    // Correção aqui: Use import.meta.env.MODE no lugar de process.env.NODE_ENV
    if (import.meta.env.MODE === "development") {
      console.warn(`[safeGetItem] Não foi possível acessar localStorage para a chave "${key}":`, error);
    }
  }
  return null;
}

/**
 * Salva um item no localStorage de forma segura.
 * @param {string} keyif (process.env.NODE_ENV === "development")
 * @param {string} value
 * @returns {boolean} Sucesso ou falha
 */
export function safeSetItem(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    // Correção aqui: Use import.meta.env.MODE no lugar de process.env.NODE_ENV
    if (import.meta.env.MODE === "development") {
      console.warn(`[safeSetItem] Não foi possível salvar no localStorage a chave "${key}":`, error);
    }
  }
  return false;
}

/**
 * Remove um item do localStorage de forma segura.
 * @param {string} key
 * @returns {boolean} Sucesso ou falha
 */
export function safeRemoveItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    // Correção aqui: Use import.meta.env.MODE no lugar de process.env.NODE_ENV
    if (import.meta.env.MODE === "development") {
      console.warn(`[safeRemoveItem] Não foi possível remover do localStorage a chave "${key}":`, error);
    }
  }
  return false;
}