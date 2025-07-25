// src/context/AuthContext.jsx (VERSÃO FINAL, COMPLETA E CORRIGIDA)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService'; // Importando do serviço

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          let userDataFromFirestore;

          if (docSnap.exists()) {
            userDataFromFirestore = docSnap.data();
          } else {
            // AQUI ESTÁ A PRIMEIRA MUDANÇA: O OBJETO COMPLETO
            console.warn(
              `[OLLO] Perfil não encontrado para ${firebaseUser.uid}. Criando perfil padrão.`
            );
            const defaultProfileData = {
              email: firebaseUser.email,
              name:
                firebaseUser.displayName || firebaseUser.email.split('@')[0],
              username: firebaseUser.email
                .split('@')[0]
                .replace(/[^a-z0-9_.]/gi, ''),
              avatarUrl: firebaseUser.photoURL || '/images/default-avatar.png',
              bio: '',
              isAdmin: false,
            };
            await createUserProfile(firebaseUser.uid, defaultProfileData);
            // Adicionamos os timestamps manualmente aqui, pois o retorno do serviço não os inclui
            userDataFromFirestore = {
              ...defaultProfileData,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }

          setCurrentUser({
            ...firebaseUser,
            ...userDataFromFirestore,
          });
        } catch (error) {
          console.error(
            '[OLLO] Erro ao buscar/criar perfil no Firestore:',
            error
          );
          setCurrentUser(firebaseUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // SEU CÓDIGO ORIGINAL RESTAURADO
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

  // SEU CÓDIGO ORIGINAL RESTAURADO
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

  // AQUI ESTÁ A SEGUNDA MUDANÇA: A FUNÇÃO REATORADA
  const registerWithEmail = async (email, password, additionalData = {}) => {
    try {
      // Passo 1: Criar usuário na Autenticação
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Passo 2: Atualizar perfil básico do Auth
      await updateProfile(user, {
        displayName: additionalData.name || '',
        photoURL: additionalData.avatarUrl || '',
      });

      // Passo 3: Chamar nosso SERVIÇO para criar o perfil no Firestore
      await createUserProfile(user.uid, additionalData);

      // Passo 4: Enviar e-mail de verificação
      await sendEmailVerification(user);

      return { success: true, user };
    } catch (error) {
      console.error('[OLLO] Erro no registro:', error);
      return { success: false, error };
    }
  };

  // SEU CÓDIGO ORIGINAL RESTAURADO
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      return { success: false, error };
    }
  };

  // SEU CÓDIGO ORIGINAL RESTAURADO E CORRETO
  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
    }),
    // As dependências corretas incluem as funções que não usam useCallback
    [
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
    ]
  );

  // SEU CÓDIGO ORIGINAL RESTAURADO
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
