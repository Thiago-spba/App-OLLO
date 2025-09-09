// ARQUIVO COMPLETO E FINAL: src/hooks/useAuth.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  sendEmailVerification,
  reload,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { createUserProfile } from '../services/firestoreService';
import { parseAuthError } from '../utils/authErrorHandler';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';

// Mensagens de erro centralizadas
const ERROR_MESSAGES = {
  PROFILE_LOAD: 'Houve um erro ao carregar os detalhes do seu perfil.',
  RELOAD_USER: 'Não foi possível atualizar seus dados. Tente novamente.',
  LOGOUT: 'Erro ao tentar sair da conta.',
  SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
};

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Função centralizada para buscar e combinar dados do usuário
  const fetchAndCombineUserData = useCallback(async (firebaseUser) => {
    // Se não há usuário autenticado, retorna null
    if (!firebaseUser) {
      return null;
    }

    try {
      // Busca os dados públicos do Firestore
      const publicDocRef = doc(db, 'users_public', firebaseUser.uid);
      const publicDocSnap = await getDoc(publicDocRef);

      let firestoreData = {};

      if (publicDocSnap.exists()) {
        firestoreData = publicDocSnap.data();
      } else {
        // Se o perfil público não existe, cria um com dados básicos.
        // Isso é uma salvaguarda para usuários que podem ter sido criados
        // antes da função de criação de perfil público existir.
        console.warn(
          `Perfil público para ${firebaseUser.uid} não encontrado. Criando um novo.`
        );
        const newProfileData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          username: `user${firebaseUser.uid.substring(0, 8)}`, // Gera um username único
          createdAt: new Date().toISOString(),
        };
        await createUserProfile(firebaseUser.uid, newProfileData);
        firestoreData = newProfileData;
      }

      // Combina os dados da autenticação (firebaseUser) com os dados do Firestore
      const combinedUser = {
        ...firebaseUser,
        ...firestoreData,
        // Garante que avatarUrl sempre tenha um valor, priorizando o do Firestore
        avatarUrl: firestoreData.avatarUrl || firebaseUser.photoURL || null,
      };

      return combinedUser;
    } catch (error) {
      console.error('[OLLO] Erro ao buscar dados do Firestore:', error);
      toast.error(ERROR_MESSAGES.PROFILE_LOAD);
      // Em caso de erro, retorna o usuário básico da autenticação para não quebrar o app
      return firebaseUser;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const fullUser = await fetchAndCombineUserData(user);
        setCurrentUser(fullUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Define o loading como false APÓS toda a lógica de busca ser concluída.
    });

    return () => unsubscribe();
  }, [fetchAndCombineUserData]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null); // Limpa o estado local
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no logout:', error);
      toast.error(ERROR_MESSAGES.LOGOUT);
      return { success: false, error };
    }
  }, []);

  const reloadCurrentUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      await reload(user);
      // O onIdTokenChanged será acionado automaticamente após o reload,
      // atualizando o usuário em toda a aplicação.
      return auth.currentUser;
    } catch (error) {
      console.error('[OLLO] Falha na sincronização do usuário:', error);
      if (
        error.code === 'auth/user-token-expired' ||
        error.code === 'auth/invalid-user-token'
      ) {
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        await logout();
      } else {
        toast.error(ERROR_MESSAGES.RELOAD_USER);
      }
      return null;
    }
  }, [logout]);

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
          // createUserProfile já é chamado dentro de fetchAndCombineUserData se o perfil não existir,
          // mas manter aqui garante que os dados `name` e `username` do formulário de registro sejam usados.
          await createUserProfile(user.uid, {
            email: user.email,
            name: additionalData.name,
            username: additionalData.username.toLowerCase(), // Padroniza para minúsculas
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
      return { success: false, error: parsedError };
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
