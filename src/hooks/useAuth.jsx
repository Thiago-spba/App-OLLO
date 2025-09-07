// ARQUIVO COMPLETO E DEFINITIVO: src/hooks/useAuth.jsx
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

  // A conexão com emuladores (se ativada) continua a mesma
  useEffect(() => {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
    ) {
      try {
        // A conexão já é feita no firebase/config.js, aqui apenas logamos
        console.log('[OLLO] useAuthLogic hook inicializado em modo emulador.');
      } catch (error) {
        console.error(
          '[OLLO] Erro no hook useAuthLogic ao tentar conectar ao emulador:',
          error
        );
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
      // CORREÇÃO DEFINITIVA: Forçamos a recarga dos dados do usuário do servidor Firebase.
      // Isso garante que, após clicar no link de verificação e fazer login,
      // obteremos o status `emailVerified: true` mais recente, quebrando o loop de redirecionamento.
      await reload(firebaseUser);

      // Após o reload, é crucial pegar a instância mais recente do auth.currentUser
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) {
        // Se por algum motivo o usuário sumir após o reload, limpamos o estado.
        setCurrentUser(null);
        return;
      }

      await refreshedUser.getIdToken(true);
      const privateDocRef = doc(db, 'users', refreshedUser.uid);
      const publicDocRef = doc(db, 'users_public', refreshedUser.uid);
      const [privateDocSnap, publicDocSnap] = await Promise.all([
        getDoc(privateDocRef),
        getDoc(publicDocRef),
      ]);

      let firestoreData;
      if (publicDocSnap.exists()) {
        firestoreData = { ...privateDocSnap.data(), ...publicDocSnap.data() };
      } else {
        const defaultProfileData = {
          email: refreshedUser.email,
          name: refreshedUser.displayName || refreshedUser.email.split('@')[0],
          username: `user_${refreshedUser.uid.substring(0, 5)}`,
        };
        firestoreData = await createUserProfile(
          refreshedUser.uid,
          defaultProfileData
        );
      }

      // Combinamos o objeto de usuário atualizado do Auth com os dados do Firestore
      const finalUserObject = { ...refreshedUser, ...firestoreData };
      setCurrentUser(finalUserObject);
      setAuthError(null);
    } catch (error) {
      console.error(
        '[OLLO] Erro CRÍTICO ao buscar/definir dados do usuário:',
        error
      );
      setCurrentUser(firebaseUser);
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

  // Nenhuma mudança necessária nas outras funções
  const reloadCurrentUser = useCallback(async () => {
    // Esta função já estava correta, forçando o reload sob demanda.
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoading(true);
      await fetchAndSetUser(firebaseUser);
      setLoading(false);
    }
  }, [fetchAndSetUser]);

  const loginWithEmail = useCallback(
    /* ...código existente sem alterações... */ async (email, password) => {
      try {
        return await firebaseAuthenticator.login(email, password);
      } catch (error) {
        return {
          success: false,
          error,
          message: error.message,
        };
      }
    },
    []
  );
  const logout = useCallback(
    /* ...código existente sem alterações... */ async (navigate) => {
      try {
        const result = await firebaseAuthenticator.logout();
        setCurrentUser(null);
        if (result.success && navigate) {
          navigate('/login');
        } else if (!result.success) {
          toast.error('Não foi possível sair.');
        }
      } catch (error) {
        toast.error('Erro no logout.');
      }
    },
    []
  );
  const registerWithEmail = useCallback(
    /* ...código existente sem alterações... */
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
  const resetPassword = useCallback(
    /* ...código existente sem alterações... */ async (email) => {
      try {
        return await firebaseAuthenticator.resetPassword(email);
      } catch (error) {
        return {
          success: false,
          error,
          message: error.message,
        };
      }
    },
    []
  );
  const resendVerificationEmail = useCallback(
    /* ...código existente sem alterações... */ async () => {
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
    },
    []
  );

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
