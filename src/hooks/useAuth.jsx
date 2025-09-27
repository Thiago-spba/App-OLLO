// ARQUIVO CORRIGIDO: src/hooks/useAuthLogic.jsx
// CORREÇÃO DUPLA: Envia email customizado no registro E detecta a verificação de forma inteligente.

import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, reload, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { parseAuthError } from '../utils/authErrorHandler';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';

const functions = getFunctions();

const ERROR_MESSAGES = {
  PROFILE_LOAD: 'Houve um erro ao carregar os detalhes do seu perfil.',
  RELOAD_USER: 'Não foi possível atualizar seus dados. Tente novamente.',
  LOGOUT: 'Erro ao tentar sair da conta.',
  SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
};

const useAuthLogic = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchingProfile = useRef(false);
  const lastFetchedUid = useRef(null);
  const emailVerificationCheck = useRef(null);

  const waitForProfile = useCallback(async (uid, maxAttempts = 5) => {
    // ... (nenhuma mudança nesta função)
    let attempts = 0;
    const delay = 2000;
    while (attempts < maxAttempts) {
      try {
        const publicDocRef = doc(db, 'users_public', uid);
        const publicDocSnap = await getDoc(publicDocRef);
        if (publicDocSnap.exists()) {
          return publicDocSnap.data();
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error('[useAuth] Erro ao verificar perfil:', error);
        break;
      }
    }
    return null;
  }, []);

  const fetchAndCombineUserData = useCallback(
    async (firebaseUser) => {
      // ... (nenhuma mudança nesta função)
      if (!firebaseUser) return null;
      if (
        fetchingProfile.current &&
        lastFetchedUid.current === firebaseUser.uid
      ) {
        return firebaseUser;
      }
      fetchingProfile.current = true;
      lastFetchedUid.current = firebaseUser.uid;
      setProfileLoading(true);
      try {
        const publicDocRef = doc(db, 'users_public', firebaseUser.uid);
        let publicDocSnap = await getDoc(publicDocRef);
        let firestoreData = {};
        if (publicDocSnap.exists()) {
          firestoreData = publicDocSnap.data();
        } else {
          const profileData = await waitForProfile(firebaseUser.uid);
          if (profileData) {
            firestoreData = profileData;
          }
        }
        const combinedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          ...firestoreData,
          avatarUrl: firestoreData.avatarUrl || firebaseUser.photoURL || null,
          username: firestoreData.username || null,
          name:
            firestoreData.name ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0],
        };
        return combinedUser;
      } catch (error) {
        toast.error(ERROR_MESSAGES.PROFILE_LOAD);
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          username: null,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        };
      } finally {
        fetchingProfile.current = false;
        setProfileLoading(false);
      }
    },
    [waitForProfile]
  );

  const forceReloadUser = useCallback(async () => {
    // ... (nenhuma mudança nesta função)
    const user = auth.currentUser;
    if (!user) return null;
    try {
      await reload(user);
      const fullUser = await fetchAndCombineUserData(user);
      setCurrentUser(fullUser);
      return fullUser;
    } catch (error) {
      if (
        error.code === 'auth/user-token-expired' ||
        error.code === 'auth/invalid-user-token'
      ) {
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        await signOut(auth); // Desloga o usuário se o token expirar
      } else {
        toast.error(ERROR_MESSAGES.RELOAD_USER);
      }
      return null;
    }
  }, [fetchAndCombineUserData]);

  useEffect(() => {
    // ... (nenhuma mudança no onAuthStateChanged)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fullUser = await fetchAndCombineUserData(user);
        setCurrentUser(fullUser);
      } else {
        setCurrentUser(null);
        lastFetchedUid.current = null;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchAndCombineUserData]);

  // MUDANÇA (Problema 2): Adiciona um listener para a visibilidade da página
  // para detectar quando o usuário volta para o nosso app após verificar o e-mail.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        auth.currentUser &&
        !auth.currentUser.emailVerified
      ) {
        console.log(
          '[useAuth] App ficou visível. Verificando status do e-mail...'
        );
        forceReloadUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceReloadUser]);

  useEffect(() => {
    // ... (o monitoramento periódico continua como uma segunda camada de segurança)
    if (currentUser && !currentUser.emailVerified) {
      emailVerificationCheck.current = setInterval(async () => {
        forceReloadUser();
      }, 30000); // Podemos diminuir a frequência agora para 30s
    } else {
      if (emailVerificationCheck.current) {
        clearInterval(emailVerificationCheck.current);
        emailVerificationCheck.current = null;
      }
    }
    return () => {
      if (emailVerificationCheck.current) {
        clearInterval(emailVerificationCheck.current);
        emailVerificationCheck.current = null;
      }
    };
  }, [currentUser, forceReloadUser]);

  const logout = useCallback(async () => {
    // ... (nenhuma mudança nesta função)
    try {
      if (emailVerificationCheck.current) {
        clearInterval(emailVerificationCheck.current);
        emailVerificationCheck.current = null;
      }
      await signOut(auth);
      setCurrentUser(null);
      lastFetchedUid.current = null;
      return { success: true };
    } catch (error) {
      toast.error(ERROR_MESSAGES.LOGOUT);
      return { success: false, error };
    }
  }, []);

  // CORREÇÃO (Problema 1): A função de registro agora usa nossa Cloud Function
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

          console.log(
            '[useAuth] Disparando e-mail de verificação customizado no registro...'
          );
          // MUDANÇA: Chamando nossa Cloud Function em vez do `sendEmailVerification` padrão.
          const sendCustomEmail = httpsCallable(
            functions,
            'sendCustomVerificationEmail'
          );
          await sendCustomEmail({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || additionalData.name,
          });

          toast.success(
            'Conta criada! Verifique seu email para ativar sua conta.'
          );
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

  const resendVerificationEmail = useCallback(async () => {
    // ... (nenhuma mudança nesta função, ela já está correta)
    const toastId = toast.loading('Reenviando e-mail de verificação...');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      const sendCustomEmail = httpsCallable(
        functions,
        'sendCustomVerificationEmail'
      );
      await sendCustomEmail({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'usuário',
      });
      toast.success('Um novo link de verificação foi enviado!', {
        id: toastId,
      });
      return { success: true };
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast.error(parsedError.message, { id: toastId });
      return { success: false, error: parsedError };
    }
  }, []);

  // ... (loginWithEmail, resetPassword, etc. sem mudanças)
  const loginWithEmail = useCallback(async (email, password) => {
    /* ... */
  }, []);
  const resetPassword = useCallback(async (email) => {
    /* ... */
  }, []);

  return {
    currentUser,
    loading,
    profileLoading,
    authError,
    loginWithEmail,
    logout,
    registerWithEmail,
    resetPassword,
    resendVerificationEmail,
    reloadCurrentUser: forceReloadUser, // Renomeado para consistência
    forceReloadUser,
  };
};

export default useAuthLogic;
