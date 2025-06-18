// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Obter URL base dinamicamente
  const getBaseUrl = () => {
    return import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_APP_URL || window.location.origin
      : window.location.origin;
  };

  // Atualizar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userData,
            });
          } else {
            // Criar documento se não existir
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Usuário OLLO',
              username: firebaseUser.email.split('@')[0],
              bio: 'Novo membro da comunidade OLLO!',
              avatarUrl:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email.split('@')[0])}&background=4f46e5&color=fff&bold=true`,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });

            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              name: firebaseUser.displayName || 'Usuário OLLO',
              username: firebaseUser.email.split('@')[0],
              avatarUrl:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email.split('@')[0])}&background=4f46e5&color=fff&bold=true`,
            });
          }
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          toast.error('Erro ao carregar dados do usuário');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Registrar novo usuário
  const registerWithEmail = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Atualizar perfil no Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: additionalData.name,
      });

      // Criar documento no Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: additionalData.name,
        username: additionalData.username.toLowerCase(),
        bio: additionalData.bio || 'Novo membro da comunidade OLLO!',
        avatarUrl:
          additionalData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(additionalData.name)}&background=4f46e5&color=fff&bold=true`,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      // Enviar email de verificação
      await sendEmailVerification(firebaseUser, {
        url: `${getBaseUrl()}/login?email_verified=true`,
        handleCodeInApp: false,
      });

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error(error.message);
      return { success: false, error };
    }
  };

  // Login com email e senha
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Atualizar último login no Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });

      toast.success(
        `Bem-vindo de volta, ${firebaseUser.displayName || 'usuário'}!`
      );
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.message);
      return { success: false, error };
    }
  };

  // Redefinir senha
  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${getBaseUrl()}/login`,
        handleCodeInApp: true,
      });
      toast.success(
        'Email de redefinição enviado! Verifique sua caixa de entrada.'
      );
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      toast.error(error.message);
      return { success: false, error };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Você saiu da sua conta com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error(error.message);
    }
  };

  // Atualizar perfil
  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('Nenhum usuário logado');

      // Atualizar no Firebase Auth se houver displayName ou photoURL
      if (updates.name || updates.avatarUrl) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name || currentUser.name,
          photoURL: updates.avatarUrl || currentUser.avatarUrl,
        });
      }

      // Atualizar no Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updates);

      // Atualizar estado local
      setCurrentUser((prev) => ({
        ...prev,
        ...updates,
      }));

      toast.success('Perfil atualizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const value = {
    currentUser,
    loading,
    registerWithEmail,
    loginWithEmail,
    logout,
    forgotPassword,
    updateUserProfile,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-ollo-light-50 dark:bg-ollo-dark-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-ollo-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-ollo-dark-700 dark:text-ollo-light-300">
              Carregando autenticação...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
