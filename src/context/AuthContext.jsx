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
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';

// Cria o contexto
const AuthContext = createContext(null);

// Hook de acesso ao contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Componente provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito: Monitora autenticação e carrega perfil no Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          const userDataFromFirestore = docSnap.exists() ? docSnap.data() : {};

          // Combina dados do Auth e do Firestore
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userDataFromFirestore,
          });
        } catch (error) {
          console.error(
            '[OLLO] Erro ao buscar perfil do usuário no Firestore:',
            error
          );
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  }, []);

  // Logout
  const logout = useCallback(async (navigate) => {
    try {
      await signOut(auth);
      if (navigate) {
        navigate('/login');
      }
    } catch {
      toast.error('Não foi possível sair.');
    }
  }, []);

  // Cadastro
  const registerWithEmail = async (email, password, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: additionalData.name || '',
        photoURL: additionalData.avatarUrl || '',
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: additionalData.name || '',
        username: additionalData.username || '',
        email: user.email,
        bio: additionalData.bio || '',
        avatarUrl: additionalData.avatarUrl || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
      });

      await sendEmailVerification(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Reset de senha
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Valor exportado pelo contexto
  const value = {
    currentUser,
    loading,
    loginWithEmail,
    logout,
    registerWithEmail,
    resetPassword,
  };

  // Renderização com loading spinner
  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AuthContext.Provider>
  );
};

/*
  [OLLO] Contexto de autenticação centralizado.
  - Sempre reflete o estado mais recente do usuário.
  - Evita race conditions.
  - Pronto para uso em rotas protegidas, menus, etc.
*/
