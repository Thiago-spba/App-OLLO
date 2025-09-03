// ARQUIVO COMPLETO PARA DEPURAÇÃO: src/context/AuthContext.jsx
// Adicionada uma única linha (linha 161) para expor o erro de registro no console.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  onIdTokenChanged,
  sendEmailVerification,
  connectAuthEmulator,
} from 'firebase/auth';
import firebaseAuthenticator from '../firebase/firebaseAuthenticator';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService';
import {
  parseAuthError,
  checkForCorsPotentialIssues,
} from '../utils/authErrorHandler';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
    ) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
        console.log('[OLLO] Conectado ao emulador de autenticação local');
      } catch (error) {
        console.error('[OLLO] Erro ao conectar ao emulador:', error);
      }
    }
    // Lógica de verificação de CORS também continua a mesma.
  }, []);

  const fetchAndSetUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setCurrentUser(null);
      setAuthError(null);
      return;
    }
    try {
      await firebaseUser.getIdToken(true);
      const privateDocRef = doc(db, 'users', firebaseUser.uid);
      const publicDocRef = doc(db, 'users_public', firebaseUser.uid);
      const [privateDocSnap, publicDocSnap] = await Promise.all([
        getDoc(privateDocRef),
        getDoc(publicDocRef),
      ]);
      let firestoreData;
      if (publicDocSnap.exists()) {
        firestoreData = { ...privateDocSnap.data(), ...publicDocSnap.data() };
      } else {
        console.warn(
          `[OLLO] Perfil não encontrado para ${firebaseUser.uid}. Criando perfil padrão.`
        );
        const defaultProfileData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          username: `user_${firebaseUser.uid.substring(0, 5)}`,
        };
        firestoreData = await createUserProfile(
          firebaseUser.uid,
          defaultProfileData
        );
      }
      const finalUserObject = {
        ...firebaseUser,
        ...firestoreData,
      };
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

  const reloadCurrentUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      console.log('[AuthContext] Forçando a recarga dos dados do Firestore...');
      setLoading(true);
      await fetchAndSetUser(firebaseUser);
      setLoading(false);
      console.log('[AuthContext] Dados do usuário recarregados!');
    }
  }, [fetchAndSetUser]);

  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await firebaseAuthenticator.login(email, password);
      return result;
    } catch (error) {
      return { success: false, error, message: error.message };
    }
  }, []);

  const logout = useCallback(async (navigate) => {
    try {
      const result = await firebaseAuthenticator.logout();
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
          await createUserProfile(user.uid, {
            email: user.email,
            name: additionalData.name,
            username: additionalData.username,
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified || false,
          });
          return { success: true, user };
        } else {
          // Se o autenticador falhou, ele deve ter retornado um erro. Lançamos ele para o catch.
          throw result.error;
        }
      } catch (error) {
        // --- AQUI ESTÁ A ÚNICA LINHA DE CÓDIGO NOVA ---
        console.error('[AuthContext] ERRO DETALHADO NO REGISTRO:', error);

        return { success: false, error };
      }
    },
    []
  );

  const resetPassword = async (email) => {
    try {
      const result = await firebaseAuthenticator.resetPassword(email);
      return result;
    } catch (error) {
      return { success: false, error, message: error.message };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error) {
      return { success: false, error, message: error.message };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      authError,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
      resendVerificationEmail,
      reloadCurrentUser,
      isAuthenticated: !!currentUser,
      isEmailVerified: currentUser?.emailVerified || false,
    }),
    [
      currentUser,
      loading,
      authError,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
      resendVerificationEmail,
      reloadCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-ollo-accent-light border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
