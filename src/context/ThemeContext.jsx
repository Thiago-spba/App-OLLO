import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // ajuste o caminho se estiver diferente
import { saveUserTheme, fetchUserTheme } from '../firebase/themePreference';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ollo-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Busca a preferência do Firestore ao logar
  useEffect(() => {
    async function loadTheme() {
      if (currentUser) {
        const theme = await fetchUserTheme(currentUser.uid);
        if (theme === 'dark' || theme === 'light') {
          setDarkMode(theme === 'dark');
        }
      }
    }
    loadTheme();
  }, [currentUser]);

  // Salva localStorage, aplica classe, e salva no Firestore se logado
  useEffect(() => {
    localStorage.setItem('ollo-theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);

    if (currentUser) {
      saveUserTheme(currentUser.uid, darkMode ? 'dark' : 'light');
    }
  }, [darkMode, currentUser]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
