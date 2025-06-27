// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { saveUserTheme, fetchUserTheme } from '../firebase/themePreference';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Carrega tema (localStorage -> sistema -> padrão)
  useEffect(() => {
    let defaultTheme = false;
    try {
      const saved = safeGetItem('ollo-theme');
      if (saved) defaultTheme = saved === 'dark';
      else if (typeof window !== 'undefined') {
        defaultTheme = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
      }
    } catch {}
    setDarkMode(defaultTheme);
    setThemeLoaded(true);
  }, []);

  // Carrega do Firestore se usuário logado
  useEffect(() => {
    async function loadTheme() {
      if (currentUser) {
        try {
          const theme = await fetchUserTheme(currentUser.uid);
          if (theme === 'dark' || theme === 'light') {
            setDarkMode(theme === 'dark');
          }
        } catch {}
      }
    }
    loadTheme();
  }, [currentUser]);

  // Salva tema, aplica classe, salva no Firestore
  useEffect(() => {
    if (!themeLoaded) return;
    try {
      safeSetItem('ollo-theme', darkMode ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);

    if (currentUser) {
      saveUserTheme(currentUser.uid, darkMode ? 'dark' : 'light');
    }
  }, [darkMode, currentUser, themeLoaded]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {themeLoaded ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
