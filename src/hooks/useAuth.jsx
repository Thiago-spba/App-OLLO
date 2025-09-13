// ARQUIVO CORRIGIDO: src/hooks/useAuth.jsx
// Versão com detecção correta de emailVerified

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase/config';
import { parseAuthError } from '../utils/authErrorHandler';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';

// Mensagens de erro centralizadas
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

  // Refs para controle
  const fetchingProfile = useRef(false);
  const lastFetchedUid = useRef(null);
  const emailVerificationCheck = useRef(null);

  // Função para aguardar criação do perfil pela Cloud Function
  const waitForProfile = useCallback(async (uid, maxAttempts = 5) => {
    let attempts = 0;
    const delay = 2000;

    while (attempts < maxAttempts) {
      try {
        const publicDocRef = doc(db, 'users_public', uid);
        const publicDocSnap = await getDoc(publicDocRef);

        if (publicDocSnap.exists()) {
          console.log(
            '[useAuth] Perfil encontrado após',
            attempts + 1,
            'tentativas'
          );
          return publicDocSnap.data();
        }

        attempts++;
        if (attempts < maxAttempts) {
          console.log(
            '[useAuth] Perfil não encontrado, tentativa',
            attempts,
            'de',
            maxAttempts
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error('[useAuth] Erro ao verificar perfil:', error);
        break;
      }
    }

    return null;
  }, []);

  // Função centralizada para buscar e combinar dados do usuário
  const fetchAndCombineUserData = useCallback(
    async (firebaseUser) => {
      if (!firebaseUser) return null;

      // Evitar buscar múltiplas vezes para o mesmo usuário
      if (
        fetchingProfile.current &&
        lastFetchedUid.current === firebaseUser.uid
      ) {
        console.log('[useAuth] Já buscando perfil para:', firebaseUser.uid);
        return firebaseUser;
      }

      fetchingProfile.current = true;
      lastFetchedUid.current = firebaseUser.uid;
      setProfileLoading(true);

      try {
        // Busca os dados públicos do Firestore
        const publicDocRef = doc(db, 'users_public', firebaseUser.uid);
        let publicDocSnap = await getDoc(publicDocRef);

        let firestoreData = {};

        if (publicDocSnap.exists()) {
          firestoreData = publicDocSnap.data();
          console.log('[useAuth] Perfil encontrado:', firestoreData.username);
        } else {
          console.log(
            '[useAuth] Perfil não encontrado, aguardando Cloud Function...'
          );
          const profileData = await waitForProfile(firebaseUser.uid);

          if (profileData) {
            firestoreData = profileData;
            console.log(
              '[useAuth] Perfil criado pela Cloud Function:',
              firestoreData.username
            );
          } else {
            console.warn('[useAuth] Perfil não foi criado após aguardar');
          }
        }

        // Combina os dados - IMPORTANTE: usar dados ATUAIS do Firebase Auth
        const combinedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified, // SEMPRE do Firebase Auth atual
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          // Dados do Firestore
          ...firestoreData,
          // Garantir que alguns campos sempre existam
          avatarUrl: firestoreData.avatarUrl || firebaseUser.photoURL || null,
          username: firestoreData.username || null,
          name:
            firestoreData.name ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0],
        };

        return combinedUser;
      } catch (error) {
        console.error('[useAuth] Erro ao buscar dados do Firestore:', error);
        toast.error(ERROR_MESSAGES.PROFILE_LOAD);

        // Em caso de erro, retorna o usuário básico da autenticação
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified, // SEMPRE do Firebase Auth atual
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

  // Função para forçar reload e atualizar estado
  const forceReloadUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      console.log('[useAuth] Forçando reload do usuário...');
      await reload(user);

      // Buscar dados atualizados
      const fullUser = await fetchAndCombineUserData(user);
      setCurrentUser(fullUser);

      console.log(
        '[useAuth] Usuário recarregado. EmailVerified:',
        user.emailVerified
      );
      return fullUser;
    } catch (error) {
      console.error('[useAuth] Erro ao recarregar usuário:', error);
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
  }, [fetchAndCombineUserData]);

  // Effect principal - MUDANÇA CRÍTICA: usar onAuthStateChanged
  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        '[useAuth] Estado de autenticação mudou:',
        user
          ? `User: ${user.email}, EmailVerified: ${user.emailVerified}`
          : 'Sem usuário'
      );

      if (user) {
        const fullUser = await fetchAndCombineUserData(user);
        setCurrentUser(fullUser);
      } else {
        setCurrentUser(null);
        lastFetchedUid.current = null;
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (emailVerificationCheck.current) {
        clearInterval(emailVerificationCheck.current);
      }
    };
  }, [fetchAndCombineUserData]);

  // Monitoramento periódico de verificação de email para usuários não verificados
  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      console.log(
        '[useAuth] Iniciando monitoramento de verificação de email...'
      );

      emailVerificationCheck.current = setInterval(async () => {
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
          console.log('[useAuth] Verificando status de email...');
          try {
            await reload(user);
            if (user.emailVerified) {
              console.log('[useAuth] Email verificado detectado!');
              const fullUser = await fetchAndCombineUserData(user);
              setCurrentUser(fullUser);

              // Parar monitoramento
              if (emailVerificationCheck.current) {
                clearInterval(emailVerificationCheck.current);
                emailVerificationCheck.current = null;
              }
            }
          } catch (error) {
            console.error('[useAuth] Erro ao verificar email:', error);
          }
        }
      }, 5000); // Verificar a cada 5 segundos
    } else {
      // Parar monitoramento se email já verificado
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
  }, [currentUser, fetchAndCombineUserData]);

  const logout = useCallback(async () => {
    try {
      // Parar monitoramento
      if (emailVerificationCheck.current) {
        clearInterval(emailVerificationCheck.current);
        emailVerificationCheck.current = null;
      }

      await signOut(auth);
      setCurrentUser(null);
      lastFetchedUid.current = null;
      return { success: true };
    } catch (error) {
      console.error('[useAuth] Erro no logout:', error);
      toast.error(ERROR_MESSAGES.LOGOUT);
      return { success: false, error };
    }
  }, []);

  const reloadCurrentUser = useCallback(async () => {
    return await forceReloadUser();
  }, [forceReloadUser]);

  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await firebaseAuthenticator.login(email, password);
      if (result.success) {
        lastFetchedUid.current = null;
      }
      return result;
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

  const resetPassword = useCallback(async (email) => {
    try {
      const result = await firebaseAuthenticator.resetPassword(email);
      if (result.success) {
        toast.success('Email de recuperação enviado!');
      }
      return result;
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast.error(parsedError.message);
      return { success: false, error: parsedError };
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
    profileLoading,
    authError,
    loginWithEmail,
    logout,
    registerWithEmail,
    resetPassword,
    resendVerificationEmail,
    reloadCurrentUser,
    forceReloadUser, // Nova função exposta
  };
};

export default useAuthLogic;
