// src/context/ThemeContext.jsx (VERSÃO REFATORADA, COMPLETA E CORRIGIDA)

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

// MUDANÇA 1: Importamos nosso hook de autenticação e o serviço correto
import { useAuth } from './AuthContext';
import { updateUserPublicProfile } from '../services/firestoreService';

// MUDANÇA 2: Importamos apenas as funções que realmente precisamos
import { safeGetItem, safeSetItem } from '../utils/safeLocalStorage';

// A criação do contexto permanece a mesma
const ThemeContext = createContext(null);

// MUDANÇA 3: O hook agora retorna 'theme' e não 'darkMode'
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // A lógica de estado agora é mais simples: 'dark' ou 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = safeGetItem('ollo-theme');
    if (savedTheme) return savedTheme;
    // Checa a preferência do sistema operacional se não houver tema salvo
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Padrão
  });

  // MUDANÇA 4: Usamos o hook de autenticação para pegar o usuário
  const { currentUser } = useAuth();

  // Efeito principal que sincroniza tudo: localStorage, HTML e Firestore
  useEffect(() => {
    // 1. Aplica a classe no documento HTML
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // 2. Salva a preferência atual no localStorage
    safeSetItem('ollo-theme', theme);
  }, [theme]); // Roda sempre que o tema muda

  // Efeito para carregar o tema do usuário quando ele faz login
  useEffect(() => {
    // O `currentUser` vem do AuthContext e pode ter a propriedade 'theme'
    // que pegamos do nosso 'getUserProfile'
    if (currentUser?.theme && currentUser.theme !== theme) {
      setTheme(currentUser.theme);
      console.debug(
        `[OLLO] Tema do usuário ${currentUser.uid} carregado do perfil: ${currentUser.theme}`
      );
    }
  }, [currentUser]); // Roda quando o usuário faz login/logout ou seu perfil muda

  // Função para o usuário alternar o tema, agora mais inteligente
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Se houver um usuário logado, salva a nova preferência no Firestore
    if (currentUser) {
      console.debug(
        `[OLLO] Salvando tema '${newTheme}' para o usuário ${currentUser.uid}`
      );
      // MUDANÇA 5: Usa nossa função de serviço correta
      updateUserPublicProfile(currentUser.uid, { theme: newTheme }).catch(
        (error) => {
          console.error(
            '[OLLO] Falha ao salvar preferência de tema no Firestore:',
            error
          );
        }
      );
    }
  }, [theme, currentUser]);

  // Valor do contexto otimizado
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
