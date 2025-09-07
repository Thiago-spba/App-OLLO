// ARQUIVO COMPLETO E CORRIGIDO: src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  sendEmailVerification,
  connectAuthEmulator,
  reload,
} from 'firebase/auth';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService';
import { parseAuthError } from '../utils/authErrorHandler';

const useAuthLogic = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
    ) {
      try {
        // A conexão com o emulador só precisa ser feita uma vez
      } catch (error) {
        console.error('[OLLO] Erro ao conectar ao emulador:', error);
      }
    }
  }, []);

  const fetchAndSetUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setAuthError(null);
      return;
    }
    try {
      // CORREÇÃO CRÍTICA: Removemos o 'await reload(firebaseUser)' daqui.
      // Esta linha estava causando um loop infinito ao ser chamada dentro do onIdTokenChanged.
      // A lógica de recarga agora será usada apenas sob demanda.

      // A partir de agora, usamos o 'firebaseUser' que recebemos como a fonte da verdade.
      const user = firebaseUser;

      await user.getIdToken(true);
      const privateDocRef = doc(db, 'users', user.uid);
      const publicDocRef = doc(db, 'users_public', user.uid);
      const [privateDocSnap, publicDocSnap] = await Promise.all([
        getDoc(privateDocRef),
        getDoc(publicDocRef),
      ]);

      let firestoreData;
      if (publicDocSnap.exists()) {
        firestoreData = { ...privateDocSnap.data(), ...publicDocSnap.data() };
      } else {
        // Lógica de criação de perfil padrão...
        const defaultProfileData = {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          username: `user_${user.uid.substring(0, 5)}`,
        };
        firestoreData = await createUserProfile(user.uid, defaultProfileData);
      }

      const finalUserObject = { ...user, ...firestoreData };
      setCurrentUser(finalUserObject);
      setAuthError(null);
    } catch (error) {
      console.error(
        '[OLLO] Erro CRÍTICO ao buscar/definir dados do usuário:',
        error
      );
      setCurrentUser(firebaseUser); // fallback para o usuário original
      setAuthError(error);
      toast.error('Houve um erro ao carregar os detalhes do seu perfil.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      await fetchAndSetUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchAndSetUser]);

  const reloadCurrentUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoading(true);
      // MANTIDO: Aqui a recarga é segura, pois é chamada por uma ação do usuário.
      await reload(firebaseUser);
      // Após o reload, pegamos a instância mais recente do usuário
      const refreshedUser = auth.currentUser;
      await fetchAndSetUser(refreshedUser);
      setLoading(false);
    }
  }, [fetchAndSetUser]);

  // As outras funções (login, logout, register, etc.) continuam iguais
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      return await firebaseAuthenticator.login(email, password);
    } catch (error) {
      return {
        success: false,
        error,
        message: error.message,
      };
    }
  }, []);

  const logout = useCallback(async (navigate) => {
    try {
      const result = await firebaseAuthenticator.logout();
      setCurrentUser(null); // Limpa o usuário no logout
      if (result.success && navigate) {
        navigate('/login');
      } else if (!result.success) {
        toast.error('Não foi possível sair.');
      }
    } catch (error) {
      toast.error('Erro no logout.');
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
          // Dispara o envio do e-mail de verificação após o registro
          await sendEmailVerification(user);

          await createUserProfile(user.uid, {
            email: user.email,
            name: additionalData.name,
            username: additionalData.username,
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified || false,
          });
          return {
            success: true,
            user,
          };
        } else {
          throw result.error;
        }
      } catch (error) {
        const parsedError = parseAuthError(error);
        toast.error(parsedError.message);
        console.error('[AuthContext] ERRO DETALHADO NO REGISTRO:', error);
        return {
          success: false,
          error: parsedError,
        };
      }
    },
    []
  );

  const resetPassword = async (email) => {
    try {
      return await firebaseAuthenticator.resetPassword(email);
    } catch (error) {
      return {
        success: false,
        error,
        message: error.message,
      };
    }
  };

  const resendVerificationEmail = useCallback(async () => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');
      await sendEmailVerification(auth.currentUser);
      toast.success('Link de verificação reenviado com sucesso!');
      return {
        success: true,
      };
    } catch (error) {
      const parsedError = parseAuthError(error);
      toast.error(parsedError.message);
      return {
        success: false,
        error,
        message: parsedError.message,
      };
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

export default useAuthLogic;
