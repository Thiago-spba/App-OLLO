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
  reload, // Importante para atualizar o token
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
    try {
      const userRef = doc(db, 'users_public', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      } else {
        console.warn('[Auth] Perfil não encontrado no Firestore.');
      }
    } catch (error) {
      // MUDANÇA: Log mais discreto. Se falhar (ex: permissão negada por não ter email verificado),
      // não queremos que o app quebre. O usuário ainda está autenticado.
      console.warn(
        '[Auth] Não foi possível carregar o perfil completo (pode ser restrição de segurança):',
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

        // 2. Enviar Email via Backend (Cloud Function)
        try {
          const sendBrevoEmail = httpsCallable(
            functions,
            'sendBrevoVerificationEmail'
          );
          // Dispara e não espera muito (fire and forget para UX rápida)
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

  // --- RECARREGAR USUÁRIO (Critical Fix para Loop de Verificação) ---
  const forceReloadUser = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // 1. Força atualização do token junto ao Firebase Auth
      // Isso é o que faz o status 'emailVerified' mudar de false para true
      await reload(user);

      // Atualiza o estado local do React imediatamente
      setCurrentUser({ ...user });

      // 2. Se verificou agora, tenta atualizar o Firestore
      if (user.emailVerified) {
        console.log('[Auth] Verificação confirmada via Reload.');

        // Tenta atualizar a flag no banco, mas não trava se falhar
        try {
          const userRef = doc(db, 'users_public', user.uid);
          // Usamos updateDoc. Se o documento não existir ou regras bloquearem, cai no catch
          await updateDoc(userRef, { verified: true });
        } catch (dbError) {
          console.warn(
            '[Auth] Erro não-crítico ao atualizar flag verified no banco:',
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
      return { success: false, error };
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
      // 1. Define usuário básico (Auth)
      setCurrentUser(user);

      if (user) {
        // 2. Tenta buscar perfil, mas garante que o app carregue mesmo se falhar
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }

      // 3. Libera o loading sempre
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
