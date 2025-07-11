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

  // Monitora o estado de autenticação do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        let extraData = {};
        // Só consulta o Firestore se o e-mail estiver verificado
        if (firebaseUser.emailVerified) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              extraData = docSnap.data();
            }
          } catch (error) {
            // Tratamento de erro opcional
            console.error('Erro ao buscar dados do Firestore:', error);
          }
        }
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          ...extraData,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login com email e senha
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

  // Cadastro com email e senha
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

      // Cria o documento do usuário no Firestore
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

      // Envia o e-mail de verificação
      await sendEmailVerification(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Reset de senha por email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const value = {
    currentUser,
    loading,
    loginWithEmail,
    logout,
    registerWithEmail,
    resetPassword,
  };

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
