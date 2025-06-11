// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Se há um usuário no Firebase, busca seus dados no Firestore.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // Usuário encontrado, combina os dados e atualiza o estado.
          setCurrentUser({
            ...docSnap.data(),
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          // Usuário existe no Auth mas não no Firestore.
          // Isso é um estado inconsistente, então tratamos como deslogado.
          // Para evitar que um usuário recém-criado caia aqui,
          // a função de registro deve criar o doc antes do listener pegar.
          setCurrentUser(null);
          // Opcional: deslogar para limpar o estado do Firebase também
          // signOut(auth);
        }
      } else {
        // Nenhum usuário no Firebase.
        setCurrentUser(null);
      }

      // A mudança CRUCIAL: setLoading(false) só é chamado DEPOIS
      // que TODAS as operações assíncronas (getDoc) e atualizações
      // de estado (setCurrentUser) terminaram.
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

    // Cria o documento do usuário no Firestore ANTES de enviar o e-mail de verificação.
    // Isso garante que o listener onAuthStateChanged sempre encontre o documento.
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

    await sendEmailVerification(firebaseUser);
    return { success: true };
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    // O listener onAuthStateChanged vai pegar a mudança e setar currentUser para null.
  };

  const value = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
