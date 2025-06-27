import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { saveUserTheme, fetchUserTheme } from '../firebase/themePreference';

// Helper seguro para checar se o localStorage está disponível
function isLocalStorageAvailable() {
  try {
    const testKey = '__ollo_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();

  // Inicializa o tema com segurança, respeitando preferência do sistema e o localStorage se disponível
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      const saved = window.localStorage.getItem('ollo-theme');
      if (saved) return saved === 'dark';
      // Detecta preferência do sistema se não houver escolha salva
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Default: claro, para SSR ou navegadores sem suporte
    return false;
  });

  // Busca do Firestore quando logado (preferência persistente do usuário)
  useEffect(() => {
    async function loadTheme() {
      if (currentUser) {
        try {
          const theme = await fetchUserTheme(currentUser.uid);
          if (theme === 'dark' || theme === 'light') {
            setDarkMode(theme === 'dark');
          }
        } catch (e) {
          // Pode logar ou notificar erro se desejar
          // console.error('Falha ao buscar tema do usuário:', e);
        }
      }
    }
    loadTheme();
  }, [currentUser]);

  // Aplica/Salva tema sempre que muda
  useEffect(() => {
    // Salva no localStorage, se disponível
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem('ollo-theme', darkMode ? 'dark' : 'light');
      } catch (e) {
        // Falha no armazenamento: ignora silenciosamente
      }
    }
    // Aplica classe ao HTML para suportar tailwind ou css do modo escuro
    document.documentElement.classList.toggle('dark', darkMode);

    // Salva no Firestore se estiver logado
    if (currentUser) {
      saveUserTheme(currentUser.uid, darkMode ? 'dark' : 'light');
    }
  }, [darkMode, currentUser]);

  // Alternar tema
  const toggleTheme = () => setDarkMode((prev) => !prev);

  // Valor exposto no contexto
  const value = { darkMode, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Hook para consumir tema facilmente
export function useTheme() {
  return useContext(ThemeContext);
}
