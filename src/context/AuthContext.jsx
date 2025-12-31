// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  reload,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'react-hot-toast';

// Importa configurações do firebase
import { auth, db, functions } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FUNÇÕES AUXILIARES ---

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
        return 'Muitas tentativas. Tente mais tarde';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return 'Ocorreu um erro na autenticação';
    }
  };

  // Busca os dados do usuário no Firestore (users_public)
  const fetchUserProfile = useCallback(async (uid) => {
    // [CORREÇÃO CRÍTICA]: Se o usuário não verificou o email,
    // NÃO tenta ler o banco de dados. Isso evita o erro "Client is offline".
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      console.log(
        '[Auth] Usuário pendente de verificação. Leitura de perfil pausada.'
      );
      setUserProfile(null);
      return;
    }

    try {
      const userRef = doc(db, 'users_public', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      } else {
        console.warn('[Auth] Perfil não encontrado no Firestore.');
      }
    } catch (error) {
      // Log discreto para não sujar o console do usuário
      console.warn(
        '[Auth] Leitura de perfil adiada (possível restrição de segurança):',
        error.code
      );
    }
  }, []);

  // --- AÇÕES PRINCIPAIS ---

  const registerWithEmail = useCallback(
    async (email, password, additionalData = {}) => {
      setLoading(true);
      try {
        // 1. Criar Usuário no Auth
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 2. Tentar enviar e-mail (mas não travar se falhar)
        try {
          const sendBrevoEmail = httpsCallable(
            functions,
            'sendBrevoVerificationEmail'
          );
          sendBrevoEmail({
            displayName:
              additionalData.name || additionalData.username || 'Usuário',
          }).catch((err) =>
            console.error('Falha silenciosa no envio de email:', err)
          );
        } catch (emailError) {
          console.error('[Auth] Erro ao tentar enviar email:', emailError);
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
    setLoading(true);
    try {
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
      setUserProfile(null);
      toast.success('Você saiu da conta.');
      return { success: true };
    } catch (error) {
      toast.error('Erro ao sair.');
      return { success: false, error };
    }
  }, []);

  // --- RECARREGAR USUÁRIO ---
  const forceReloadUser = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // 1. Força atualização do token no Firebase Auth
      await reload(user);

      // Atualiza estado local
      setCurrentUser({ ...user });

      // 2. Se verificou, tenta atualizar a flag no banco
      if (user.emailVerified) {
        console.log('[Auth] Verificação confirmada via Reload.');

        try {
          const userRef = doc(db, 'users_public', user.uid);
          // Tenta atualizar, mas ignora erro se o banco estiver restrito
          await updateDoc(userRef, { verified: true }).catch(() => {});
        } catch (dbError) {
          console.warn(
            '[Auth] Erro não-crítico ao atualizar flag no banco:',
            dbError
          );
        }

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
        displayName: userProfile?.name || currentUser?.displayName || 'Usuário',
      });

      return { success: true };
    } catch (error) {
      console.error('[Auth] Erro ao reenviar:', error);
      // Retorna o erro para a UI tratar
      throw error;
    }
  }, [userProfile, currentUser]);

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
      setCurrentUser(user);

      if (user) {
        // Só busca perfil se o email estiver verificado ou se suas regras permitirem leitura pública
        // Para segurança, blindamos aqui também
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
    resendVerificationEmail,
    forgotPassword,
    forceReloadUser,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
