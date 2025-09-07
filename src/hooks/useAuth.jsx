// ARQUIVO COMPLETO E DEFINITIVO: src/hooks/useAuth.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  sendEmailVerification,
  reload,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService';
import { parseAuthError } from '../utils/authErrorHandler';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator'; // Re-adicionado para compatibilidade, mas sua abordagem de import direto é válida também.

// Constantes para mensagens de erro - Excelente prática!
const ERROR_MESSAGES = {
  PROFILE_LOAD: 'Houve um erro ao carregar os detalhes do seu perfil.',
  RELOAD_USER: 'Não foi possível atualizar seus dados. Tente novamente.',
  LOGOUT: 'Erro ao tentar sair da conta.',
  NETWORK: 'Erro de conexão de rede.',
};

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchAndSetUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setAuthError(null);
      return;
    }

    try {
      const [privateDoc, publicDoc] = await Promise.all([
        getDoc(doc(db, 'users', firebaseUser.uid)),
        getDoc(doc(db, 'users_public', firebaseUser.uid)),
      ]);

      let firestoreData;
      if (publicDoc.exists()) {
        firestoreData = { ...privateDoc.data(), ...publicDoc.data() };
      } else {
        // Lógica para criar um perfil caso não exista
        firestoreData = await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          username: `user_${firebaseUser.uid.substring(0, 5)}`,
          createdAt: new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
        });
      }

      const userWithData = {
        // Pegamos as propriedades essenciais e seguras do auth
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        // E combinamos com os dados do Firestore
        ...firestoreData,
      };

      setCurrentUser(userWithData);
      setAuthError(null);
    } catch (error) {
      console.error(
        '[OLLO] Erro ao buscar dados do usuário do Firestore:',
        error
      );
      setAuthError(error);
      // Mesmo com erro de Firestore, setamos o usuário base do Firebase Auth para que a UI não quebre.
      setCurrentUser(firebaseUser);
      toast.error(ERROR_MESSAGES.PROFILE_LOAD);
    }
  }, []);

  // Listener de estado de autenticação - estável e limpo
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      await fetchAndSetUser(user);
      setLoading(false); // Fim do carregamento inicial
    });

    // Função de limpeza do useEffect, a forma correta de evitar leaks
    return () => unsubscribe();
  }, [fetchAndSetUser]);

  // Função robusta para recarregar dados sob demanda
  const reloadCurrentUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      await reload(user);
      // O listener `onIdTokenChanged` irá pegar a mudança e atualizar o estado.
      // O `setLoading(false)` será chamado pelo listener.
    } catch (error) {
      console.error('[OLLO] Falha no reload:', error);
      toast.error(ERROR_MESSAGES.RELOAD_USER);
      setLoading(false); // Garante que pare de carregar em caso de erro.
    }
  }, []);

  // Sua ótima versão do logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // O listener `onIdTokenChanged` vai detectar o logout e setar currentUser para null.
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no logout:', error);
      toast.error(ERROR_MESSAGES.LOGOUT);
      return { success: false, error };
    }
  }, []);

  // --- Demais funções baseadas no seu primeiro arquivo para manter a compatibilidade ---
  // A sua refatoração com import dinâmico também é válida, esta é só uma alternativa.
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      return await firebaseAuthenticator.login(email, password);
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast.error(parsedError.message);
      return { success: false, error: parsedError };
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email, password, additionalData) => {
      try {
        const result = await firebaseAuthenticator.register(
          email,
          password,
          additionalData
        );
        if (result.success) {
          const user = result.user;
          await sendEmailVerification(user);
          await createUserProfile(user.uid, {
            email: user.email,
            name: additionalData.name,
            username: additionalData.username,
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified || false,
          });
          return { success: true, user };
        } else {
          throw result.error;
        }
      } catch (error) {
        const parsedError = parseAuthError(error);
        toast.error(parsedError.message);
        return { success: false, error: parsedError };
      }
    },
    []
  );

  const resetPassword = useCallback(async (email) => {
    try {
      return await firebaseAuthenticator.resetPassword(email);
    } catch (error) {
      return { success: false, error, message: error.message };
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');
      await sendEmailVerification(auth.currentUser);
      toast.success('Link de verificação reenviado!');
      return { success: true };
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast.error(parsedError.message);
      return { success: false, error, message: parsedError.message };
    }
  }, []);

  return {
    currentUser,
    loading,
    authError,
    loginWithEmail,
    logout,
    registerWithEmail,
    resetPassword,
    resendVerificationEmail,
    reloadCurrentUser,
  };
};

export default useAuth;
