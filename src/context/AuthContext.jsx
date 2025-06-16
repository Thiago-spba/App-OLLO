// Revisão: Testando alteração visível no Git

// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurações comuns
  const getBaseUrl = () => {
    return process.env.NODE_ENV === 'production'
      ? 'https://olloapp.com.br'
      : window.location.origin;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setCurrentUser({
            ...docSnap.data(),
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email, password, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: additionalData.name,
      username: additionalData.username,
      bio: 'Novo membro do OLLO!',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(additionalData.name)}&background=0D1B2A&color=E0E1DD&bold=true`,
      createdAt: serverTimestamp(),
    });

    // Configuração para verificação de e-mail
    const emailVerificationSettings = {
      url: `${getBaseUrl()}/login?email_verified=true`,
      handleCodeInApp: false, // Melhor para verificação de e-mail
    };

    await sendEmailVerification(firebaseUser, emailVerificationSettings);

    return { success: true };
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const forgotPassword = (email) => {
    // Configuração para redefinição de senha
    const passwordResetSettings = {
      url: `${getBaseUrl()}/reset-password`,
      handleCodeInApp: true, // Necessário para redefinição de senha
    };

    return sendPasswordResetEmail(auth, email, passwordResetSettings);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
