// ARQUIVO CORRIGIDO: src/context/AuthContext.jsx

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
          // CORREÇÃO: Força a atualização do token de autenticação.
          // Esta é a única linha adicionada. Ela resolve o erro 400 Bad Request
          // que ocorre após o registro, garantindo que o estado do usuário esteja sincronizado.
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

  const registerWithEmail = useCallback(
    async (email, password, additionalData) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, { displayName: additionalData.name });

        await createUserProfile(user.uid, {
          email: user.email,
          name: additionalData.name,
          username: additionalData.username,
        });

        return { success: true, user };
      } catch (error) {
        console.error('[OLLO] Erro no registro:', error);
        return { success: false, error };
      }
    },
    []
  );

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      return { success: false, error };
    }
  };

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
