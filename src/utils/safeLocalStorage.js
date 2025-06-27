// src/utils/safeLocalStorage.js

export function safeGetItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return null;
  }
  
  export function safeSetItem(key, value) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  }
  
  export function safeRemoveItem(key) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }
  