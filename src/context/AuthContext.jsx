// src/context/AuthContext.jsx

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
  signOut,
  createUserWithEmailAndPassword,
  // sendEmailVerification, // MUDANÇA: Não vamos mais importar isso diretamente.
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService';

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

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
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
        } catch (error) {
          console.error(
            '[OLLO] Erro CRÍTICO ao buscar/criar perfil no Firestore:',
            error
          );
          setCurrentUser(firebaseUser);
          toast.error('Houve um erro ao carregar seu perfil.');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('[OLLO] Erro no login:', error);
      return { success: false, error };
    }
  }, []);

  const logout = useCallback(async (navigate) => {
    try {
      await signOut(auth);
      if (navigate) {
        navigate('/login');
      }
    } catch (error) {
      console.error('[OLLO] Erro no logout:', error);
      toast.error('Não foi possível sair.');
    }
  }, []);

  // MUDANÇA CRÍTICA APLICADA
  const registerWithEmail = useCallback(
    async (email, password, additionalData) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Primeiro, atualizamos o perfil no Firebase Auth (isso é rápido)
        await updateProfile(user, { displayName: additionalData.name });

        // Em seguida, criamos os documentos no Firestore
        await createUserProfile(user.uid, {
          email: user.email,
          name: additionalData.name,
          username: additionalData.username,
        });

        // CORREÇÃO: A linha abaixo foi REMOVIDA.
        // Esta era a linha que enviava o e-mail de verificação PADRÃO do Firebase.
        // Ao removê-la, nós permitimos que a nossa Cloud Function seja a ÚNICA
        // responsável por enviar o e-mail PERSONALIZADO da OLLO.
        // await sendEmailVerification(user);

        return { success: true, user };
      } catch (error) {
        console.error('[OLLO] Erro no registro:', error);
        return { success: false, error };
      }
    },
    []
  );

  const resetPassword = async (email) => {
    // PRÓXIMO PASSO: Para personalizar este e-mail, teremos que refatorar esta função.
    // Criaremos uma Cloud Function "Callable" que gera o link de reset e o envia
    // com nosso template da OLLO, assim como fizemos para o e-mail de boas-vindas.
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      return { success: false, error };
    }
  };

  // CORREÇÃO: Otimizando o hook useMemo para incluir todas as suas dependências.
  // Isso garante que o contexto sempre fornecerá as versões mais recentes das funções,
  // evitando bugs de "stale closure" e melhorando a estabilidade.
  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
    }),
    [
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
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
