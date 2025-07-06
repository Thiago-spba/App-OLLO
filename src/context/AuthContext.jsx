// src/context/AuthContext.jsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
// IMPORTANTE: O useNavigate NÃO é mais importado aqui no topo do arquivo.
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
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // A chamada do useNavigate foi REMOVIDA daqui.

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ... a lógica de carregar o usuário permanece a mesma
      setLoading(true);
      if (firebaseUser) {
        // ... sua lógica de buscar dados do Firestore ...
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          ...(docSnap.exists() ? docSnap.data() : {}),
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // A função logout agora recebe a função de navegação como PARÂMETRO.
  const logout = useCallback(async (navigate) => {
    try {
      await signOut(auth);
      if (navigate) {
        navigate('/login');
      }
    } catch (error) {
      toast.error('Não foi possível sair.');
    }
  }, []);

  const value = {
    currentUser,
    loading,
    logout,
    // ... suas outras funções, como registerWithEmail, loginWithEmail, etc.
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
