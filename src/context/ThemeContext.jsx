// src/context/ThemeContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useAuth } from './AuthContext'; // COMENTAR ou DELETAR esta linha
import * as AuthModule from './AuthContext'; // <--- NOVA LINHA DE IMPORTAÇÃO

import { saveUserTheme, fetchUserTheme } from '../firebase/userFirestore';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // const { currentUser } = useAuth(); // LINHA ANTIGA
  const { currentUser } = AuthModule.useAuth(); // <--- NOVA CHAMADA DO HOOK useAuth

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
        console.log(
          '[OLLO ThemeContext] Tentando buscar tema para UID:',
          currentUser.uid
        ); // LOG
        try {
          const theme = await fetchUserTheme(currentUser.uid);
          if (theme === 'dark' || theme === 'light') {
            setDarkMode(theme === 'dark');
          }
        } catch (error) {
          // Capture o erro para logar aqui
          console.error(
            '[OLLO ThemeContext] Erro ao buscar tema do Firestore (fetchUserTheme):',
            error
          ); // LOG
        }
      } else {
        console.log(
          '[OLLO ThemeContext] Nenhum usuário logado para buscar tema.'
        ); // LOG
      }
    }
    loadTheme();
  }, [currentUser]); // currentUser como dependência é OK

  // Salva tema, aplica classe, salva no Firestore
  useEffect(() => {
    if (!themeLoaded) return;
    try {
      safeSetItem('ollo-theme', darkMode ? 'dark' : 'light');
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);

    if (currentUser) {
      console.log(
        '[OLLO ThemeContext] Tentando salvar tema para UID:',
        currentUser.uid,
        'Tema:',
        darkMode ? 'dark' : 'light'
      ); // LOG
      saveUserTheme(currentUser.uid, darkMode ? 'dark' : 'light');
    } else {
      console.log(
        '[OLLO ThemeContext] Nenhum usuário logado para salvar tema no Firestore.'
      ); // LOG
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
