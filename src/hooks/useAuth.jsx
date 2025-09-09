// ARQUIVO CORRIGIDO: src/hooks/useAuth.jsx
// Versão sem criação automática de perfil (deixa para Cloud Function)

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  onIdTokenChanged,
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

  // Ref para controlar se já está buscando perfil
  const fetchingProfile = useRef(false);
  const lastFetchedUid = useRef(null);

  // Função para aguardar criação do perfil pela Cloud Function
  const waitForProfile = useCallback(async (uid, maxAttempts = 5) => {
    let attempts = 0;
    const delay = 2000; // 2 segundos entre tentativas

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
      // Se não há usuário autenticado, retorna null
      if (!firebaseUser) {
        return null;
      }

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
          // Perfil não existe ainda - aguardar Cloud Function criar
          console.log(
            '[useAuth] Perfil não encontrado, aguardando Cloud Function...'
          );

          // Aguardar a Cloud Function criar o perfil
          const profileData = await waitForProfile(firebaseUser.uid);

          if (profileData) {
            firestoreData = profileData;
            console.log(
              '[useAuth] Perfil criado pela Cloud Function:',
              firestoreData.username
            );
          } else {
            // Se ainda não existe após aguardar, retornar apenas dados básicos
            console.warn('[useAuth] Perfil não foi criado após aguardar');
            // NÃO criar perfil aqui - deixar para Cloud Function ou processo manual
          }
        }

        // Combina os dados da autenticação com os dados do Firestore
        const combinedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          // Dados do Firestore (se existirem)
          ...firestoreData,
          // Garantir que alguns campos sempre existam
          avatarUrl: firestoreData.avatarUrl || firebaseUser.photoURL || null,
          username: firestoreData.username || null, // Importante: pode ser null
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

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
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

  const logout = useCallback(async () => {
    try {
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
    const user = auth.currentUser;
    if (!user) return null;

    try {
      await reload(user);
      // Forçar refetch dos dados do Firestore
      lastFetchedUid.current = null;
      const fullUser = await fetchAndCombineUserData(user);
      setCurrentUser(fullUser);
      return fullUser;
    } catch (error) {
      console.error('[useAuth] Falha na sincronização do usuário:', error);
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
  }, [logout, fetchAndCombineUserData]);

  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await firebaseAuthenticator.login(email, password);
      if (result.success) {
        // Limpar cache para forçar busca do perfil
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

          // Enviar email de verificação
          await sendEmailVerification(user);

          // NÃO criar perfil aqui - deixar para Cloud Function
          // A Cloud Function onnewusercreated será acionada automaticamente

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
  };
};

// IMPORTANTE: Exportar como default para evitar conflito com o contexto
export default useAuthLogic;
