// src/context/ThemeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import * as AuthModule from './AuthContext';
import { saveUserTheme, fetchUserTheme } from '../firebase/userFirestore';
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const { currentUser, loading: authLoading } = AuthModule.useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const isInitialLoad = useRef(true);
  const themeChangedByUser = useRef(false);

  // 1. Efeito para carregar tema inicial (executa apenas uma vez)
  useEffect(() => {
    const loadInitialTheme = () => {
      try {
        const savedTheme = safeGetItem('ollo-theme');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia) {
          setDarkMode(
            window.matchMedia('(prefers-color-scheme: dark)').matches
          );
        }
      } catch (e) {
        console.error('[OLLO] Erro ao carregar tema inicial:', e);
      } finally {
        setThemeLoaded(true);
      }
    };

    loadInitialTheme();
  }, []);

  // 2. Efeito para buscar tema do Firestore (executa quando usuário muda)
  useEffect(() => {
    if (
      authLoading ||
      !themeLoaded ||
      !currentUser?.uid ||
      themeChangedByUser.current
    ) {
      return;
    }

    const loadUserTheme = async () => {
      try {
        const firestoreTheme = await fetchUserTheme(currentUser.uid);
        if (firestoreTheme === 'dark' || firestoreTheme === 'light') {
          console.debug(`[OLLO] Tema do usuário carregado: ${firestoreTheme}`);
          isInitialLoad.current = true;
          setDarkMode(firestoreTheme === 'dark');
        }
      } catch (error) {
        console.error('[OLLO] Erro ao buscar tema:', error);
      }
    };

    loadUserTheme();
  }, [currentUser?.uid, authLoading, themeLoaded]);

  // 3. Efeito para salvar tema no Firestore (apenas quando usuário muda manualmente)
  useEffect(() => {
    if (
      isInitialLoad.current ||
      !currentUser?.uid ||
      !themeChangedByUser.current
    ) {
      return;
    }

    const saveTheme = async () => {
      const themeToSave = darkMode ? 'dark' : 'light';
      console.debug(`[OLLO] Salvando tema: ${themeToSave}`);
      try {
        await saveUserTheme(currentUser.uid, themeToSave);
      } catch (error) {
        console.error('[OLLO] Erro ao salvar tema:', error);
      } finally {
        themeChangedByUser.current = false;
      }
    };

    saveTheme();
  }, [darkMode, currentUser?.uid]);

  // 4. Efeito para aplicar tema no DOM
  useEffect(() => {
    if (!themeLoaded) return;

    const htmlClass = document.documentElement.classList;
    darkMode ? htmlClass.add('dark') : htmlClass.remove('dark');

    try {
      safeSetItem('ollo-theme', darkMode ? 'dark' : 'light');
    } catch (e) {
      console.error('[OLLO] Erro ao salvar tema localmente:', e);
    }
  }, [darkMode, themeLoaded]);

  // Função para alternar tema
  const toggleTheme = useCallback(() => {
    themeChangedByUser.current = true;
    setDarkMode((prev) => !prev);
  }, []);

  // Valor do contexto otimizado
  const contextValue = useMemo(
    () => ({
      darkMode,
      toggleTheme,
      themeLoaded,
    }),
    [darkMode, toggleTheme, themeLoaded]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
