// src/context/AuthContext.jsx
// VERSÃO COMPLETAMENTE CORRIGIDA - SEM DEPENDÊNCIAS EXTERNAS PROBLEMÁTICAS

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signOut,
  reload,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase/config';
import { toast } from 'react-hot-toast';

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

  // Função para criar perfil do usuário no Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users_public', user.uid);

    try {
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        const { email, uid } = user;
        const createdAt = new Date();

        await setDoc(userRef, {
          email,
          uid,
          createdAt,
          ...additionalData,
        });

        console.log('[Auth] Perfil do usuário criado no Firestore');
      }
    } catch (error) {
      console.error('[Auth] Erro ao criar perfil:', error);
    }
  };

  // Função de registro
  const registerWithEmail = useCallback(
    async (email, password, additionalData = {}) => {
      try {
        setLoading(true);

        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Criar perfil no Firestore
        await createUserProfile(user, additionalData);

        // Enviar email de verificação
        const sendEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
        await sendEmail();

        toast.success('Conta criada! Verifique seu email para ativar.');

        return { success: true, user };
      } catch (error) {
        console.error('[Auth] Erro no registro:', error);
        toast.error(getErrorMessage(error.code));
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Função de login
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      setLoading(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      toast.success('Login realizado com sucesso!');

      return { success: true, user };
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      toast.error(getErrorMessage(error.code));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro no logout:', error);
      toast.error('Erro ao sair da conta');
      return { success: false, error };
    }
  }, []);

  // Função para reenviar email de verificação
  const resendVerificationEmail = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const sendEmail = httpsCallable(functions, 'sendCustomVerificationEmail');
      await sendEmail();
      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro ao reenviar email:', error);
      return { success: false, error };
    }
  }, []);

  // Função para recuperação de senha
  const forgotPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro na recuperação de senha:', error);
      throw error;
    }
  }, []);

  // Função para forçar reload do usuário
  const forceReloadUser = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await reload(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('[Auth] Erro ao recarregar usuário:', error);
      return null;
    }
  }, []);

  // Função para obter mensagens de erro amigáveis
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/weak-password':
        return 'Senha muito fraca';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      default:
        return 'Ocorreu um erro. Tente novamente';
    }
  };

  // Effect para monitorar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        '[Auth] Estado de autenticação mudou:',
        user ? user.email : 'Nenhum usuário'
      );

      if (user) {
        // Buscar dados adicionais do Firestore se necessário
        try {
          const userRef = doc(db, 'users_public', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({ ...user, ...userData });
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('[Auth] Erro ao buscar dados do usuário:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Valores computados
  const value = {
    currentUser,
    loading,

    // Funções de autenticação
    registerWithEmail,
    loginWithEmail,
    logout,
    resendVerificationEmail,
    forgotPassword,
    forceReloadUser,

    // Propriedades úteis
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
