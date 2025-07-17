// src/context/AuthContext.jsx (CORRIGIDO E ESTABILIZADO)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo, // 1. IMPORTAÇÃO ADICIONADA
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
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
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
          let userDataFromFirestore = {};

          if (docSnap.exists()) {
            userDataFromFirestore = docSnap.data();
          } else {
            console.log(
              `[OLLO] Criando documento de perfil para ${firebaseUser.uid} (usuário novo).`
            );
            const defaultProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL || '',
              bio: '',
              username: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              emailVerified: firebaseUser.emailVerified,
            };
            await setDoc(userDocRef, defaultProfileData, { merge: true });
            userDataFromFirestore = defaultProfileData;
          }

          // Combina dados do Auth e do Firestore para um objeto de usuário completo
          setCurrentUser({
            ...firebaseUser, // Dados brutos do Auth (necessário para métodos como .reload())
            ...userDataFromFirestore, // Seus dados do Firestore
          });
        } catch (error) {
          console.error(
            '[OLLO] Erro ao buscar/criar perfil no Firestore:',
            error
          );
          setCurrentUser(firebaseUser); // Fallback apenas com dados do Auth
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Dependência vazia é correta aqui

  // Funções de ação (já estavam estáveis com useCallback)
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
      console.error('[OLLO] Erro no registro:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      return { success: false, error };
    }
  };

  // 2. ESTABILIZAÇÃO DO OBJETO DE VALOR DO CONTEXTO
  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
    }),
    [currentUser, loading, loginWithEmail, logout]
  ); // As dependências são os valores que, se mudarem, devem gerar um novo objeto `value`

  // Renderização com loading spinner
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
