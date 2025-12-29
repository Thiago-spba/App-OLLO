// src/context/AuthContext.jsx
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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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

  // --- FUNÇÕES AUXILIARES ---

  // Cria ou atualiza o perfil no Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users_public', user.uid);

    try {
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) {
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          createdAt: new Date(),
          emailVerified: user.emailVerified,
          ...additionalData,
        });
      }
    } catch (error) {
      console.error('[Auth] Erro ao criar perfil:', error);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      default:
        return 'Ocorreu um erro na autenticação';
    }
  };

  // --- AÇÕES PRINCIPAIS ---

  const registerWithEmail = useCallback(
    async (email, password, additionalData = {}) => {
      try {
        setLoading(true);
        // 1. Criar Auth
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 2. Criar Firestore
        await createUserProfile(user, additionalData);

        // 3. Enviar Email (Brevo)
        try {
          const sendBrevoEmail = httpsCallable(
            functions,
            'sendBrevoVerificationEmail'
          );
          await sendBrevoEmail({
            email: user.email,
            displayName:
              additionalData.name || additionalData.username || 'Usuário',
          });
        } catch (emailError) {
          console.error('[Auth] Falha no envio de e-mail:', emailError);
        }

        toast.success('Conta criada! Verifique seu email.');
        return { success: true, user };
      } catch (error) {
        console.error('[Auth] Erro registro:', error);
        toast.error(getErrorMessage(error.code));
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loginWithEmail = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Bem-vindo de volta!');
      return { success: true, user };
    } catch (error) {
      toast.error(getErrorMessage(error.code));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      toast.success('Você saiu da conta.');
      return { success: true };
    } catch (error) {
      toast.error('Erro ao sair.');
      return { success: false, error };
    }
  }, []);

  // --- SOLUÇÃO CRÍTICA PARA O LOOP DE VERIFICAÇÃO ---
  const forceReloadUser = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // 1. Força o SDK a baixar o novo token do Google
      await reload(user);

      // 2. Verifica se o status mudou para VERIFICADO
      if (user.emailVerified) {
        console.log('[Auth] Verificação detectada! Sincronizando...');

        // 3. Atualiza o Firestore (Fonte da Verdade do Backend)
        const userRef = doc(db, 'users_public', user.uid);
        // Usamos updateDoc para não sobrescrever outros dados
        await updateDoc(userRef, { emailVerified: true }).catch((err) =>
          console.warn('Erro ao atualizar firestore (pode ser permissão):', err)
        );

        // 4. ATUALIZA O ESTADO DO REACT (Fonte da Verdade do Frontend)
        // Isso força o re-render de toda a aplicação com o novo status
        setCurrentUser((prev) => ({
          ...prev,
          emailVerified: true,
        }));

        return { ...user, emailVerified: true };
      }

      return user;
    } catch (error) {
      console.error('[Auth] Erro ao recarregar usuário:', error);
      return null;
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não logado');

      const sendBrevoEmail = httpsCallable(
        functions,
        'sendBrevoVerificationEmail'
      );
      await sendBrevoEmail({
        displayName: auth.currentUser.displayName || 'Usuário',
      });
      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro ao reenviar:', error);
      return { success: false, error };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  // --- OBSERVADOR DE ESTADO ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users_public', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            // Mescla dados do Auth com dados do Firestore
            setCurrentUser({ ...user, ...userDoc.data() });
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('[Auth] Erro ao carregar perfil:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
    resendVerificationEmail,
    forgotPassword,
    forceReloadUser, // A Chave da Solução
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
