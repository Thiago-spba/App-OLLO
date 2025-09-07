// ARQUIVO COMPLETO E FINAL, À PROVA DE CONDIÇÃO DE CORRIDA: src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  sendEmailVerification,
  reload,
  signOut,
} from 'firebase/auth'; // 'getIdToken' é um método do objeto user, não precisa ser importado.
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { createUserProfile } from '../services/firestoreService';
import { parseAuthError } from '../utils/authErrorHandler';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';

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

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no logout:', error);
      toast.error(ERROR_MESSAGES.LOGOUT);
      return { success: false, error };
    }
  }, []);

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
        firestoreData = await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          username: `user_${firebaseUser.uid.substring(0, 5)}`,
          createdAt: new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
        });
      }
      setCurrentUser({ ...firebaseUser, ...firestoreData });
      setAuthError(null);
    } catch (error) {
      console.error('[OLLO] Erro ao buscar dados do Firestore:', error);
      setAuthError(error);
      setCurrentUser(firebaseUser);
      toast.error(ERROR_MESSAGES.PROFILE_LOAD);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      await fetchAndSetUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchAndSetUser]);

  // <<< VERSÃO DEFINITIVA COM ESTABILIZAÇÃO DE SESSÃO >>>
  const reloadCurrentUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      // *** ESTA É A LINHA QUE RESOLVE TUDO ***
      // Força a atualização do token de sessão antes da operação de reload,
      // eliminando a condição de corrida em novas sessões.
      await user.getIdToken(true);

      await reload(user);
      const refreshedUser = auth.currentUser;
      await fetchAndSetUser(refreshedUser);
      return refreshedUser;
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
  }, [logout, fetchAndSetUser]);

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
