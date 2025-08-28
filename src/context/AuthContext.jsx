// ARQUIVO MELHORADO: src/context/AuthContext.jsx

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
  connectAuthEmulator, // Adicionada a importação que faltava
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

// Contexto de autenticação
const AuthContext = createContext(null);

// Hook para usar o contexto de autenticação
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

  // Inicialização do emulador em ambiente de desenvolvimento se necessário
  useEffect(() => {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
    ) {
      try {
        // Conecta ao emulador local de autenticação
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
        console.log('[OLLO] Conectado ao emulador de autenticação local');
      } catch (error) {
        console.error('[OLLO] Erro ao conectar ao emulador:', error);
      }
    }

    // Verifica e alerta sobre possíveis problemas de CORS
    if (import.meta.env.DEV && checkForCorsPotentialIssues()) {
      console.warn(`
        [OLLO] Ambiente de desenvolvimento local detectado (${window.location.origin})
        Isso pode causar problemas de CORS com a autenticação Firebase.
        Soluções recomendadas:
        1. Adicione este domínio como "Authorized Domains" no console Firebase
        2. Use emuladores locais do Firebase (ative VITE_USE_FIREBASE_EMULATORS=true)
        3. Use uma versão hospedada do aplicativo em vez do localhost
      `);
    }
  }, []);

  // Observer para mudanças no token de autenticação
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Força a atualização do token de autenticação para evitar erros 400 Bad Request
          await firebaseUser.getIdToken(true);

          const privateDocRef = doc(db, 'users', firebaseUser.uid);
          const publicDocRef = doc(db, 'users_public', firebaseUser.uid);

          const [privateDocSnap, publicDocSnap] = await Promise.all([
            getDoc(privateDocRef),
            getDoc(publicDocRef),
          ]);

          let finalUserData;

          if (!publicDocSnap.exists()) {
            console.warn(
              `[OLLO] Perfil não encontrado para ${firebaseUser.uid}. Criando perfil padrão.`
            );
            const defaultProfileData = {
              email: firebaseUser.email,
              name:
                firebaseUser.displayName || firebaseUser.email.split('@')[0],
              username: `user_${firebaseUser.uid.substring(0, 5)}`,
            };

            finalUserData = await createUserProfile(
              firebaseUser.uid,
              defaultProfileData
            );
          } else {
            finalUserData = {
              ...privateDocSnap.data(),
              ...publicDocSnap.data(),
            };
          }

          setCurrentUser({
            ...firebaseUser,
            ...finalUserData,
          });
          setAuthError(null);
        } catch (error) {
          console.error(
            '[OLLO] Erro CRÍTICO ao buscar/criar perfil no Firestore:',
            error
          );
          setCurrentUser(firebaseUser);
          setAuthError(error);
          toast.error('Houve um erro ao carregar seu perfil.');
        }
      } else {
        setCurrentUser(null);
        setAuthError(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login com email e senha com tratamento aprimorado de erros
  // Login com email e senha usando o authenticator robusto
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      console.log('[OLLO] Iniciando processo de login...');
      // Usa o authenticator que lida com problemas de CORS automaticamente
      const result = await firebaseAuthenticator.login(email, password);

      if (result.success) {
        console.log('[OLLO] Login bem-sucedido');
      } else {
        console.error('[OLLO] Erro no login:', result.error);
      }

      return result;
    } catch (error) {
      console.error('[OLLO] Erro inesperado no login:', error);
      return {
        success: false,
        error,
        message: error.message || 'Ocorreu um erro inesperado durante o login.',
      };
    }
  }, []);

  // Logout usando authenticator
  const logout = useCallback(async (navigate) => {
    try {
      const result = await firebaseAuthenticator.logout();

      if (result.success) {
        if (navigate) {
          navigate('/login');
        }
      } else {
        const errorInfo = parseAuthError(result.error);
        toast.error(errorInfo.message || 'Não foi possível sair.');
      }
    } catch (error) {
      console.error('[OLLO] Erro no logout:', error);
      const errorInfo = parseAuthError(error);
      toast.error(errorInfo.message || 'Não foi possível sair.');
    }
  }, []);

  // Registro com email e senha usando authenticator
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

          // Cria o perfil do usuário no Firestore
          await createUserProfile(user.uid, {
            email: user.email,
            name: additionalData.name,
            username: additionalData.username,
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified || false,
          });

          return { success: true, user };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('[OLLO] Erro no registro:', error);
        return { success: false, error };
      }
    },
    [] // Removida a dependência createUserProfile pois já está importada no nível superior
  );

  // Reset de senha usando authenticator
  const resetPassword = async (email) => {
    try {
      const result = await firebaseAuthenticator.resetPassword(email);

      if (!result.success) {
        const errorInfo = parseAuthError(result.error);
        return {
          success: false,
          error: result.error,
          message: errorInfo.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      const errorInfo = parseAuthError(error);
      return { success: false, error, message: errorInfo.message };
    }
  };

  // Reenvio de email de verificação
  const resendVerificationEmail = async () => {
    try {
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      await sendEmailVerification(currentUser);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro ao reenviar email de verificação:', error);
      const errorInfo = parseAuthError(error);
      return { success: false, error, message: errorInfo.message };
    }
  };

  // Valores expostos pelo contexto
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
