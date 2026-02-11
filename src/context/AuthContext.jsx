// ARQUIVO: src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca perfil no Firestore
  const fetchUserProfile = useCallback(async (uid) => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      setUserProfile(null);
      return;
    }
    try {
      const docSnap = await getDoc(doc(db, 'users_public', uid));
      if (docSnap.exists()) setUserProfile(docSnap.data());
    } catch (error) {
      console.warn('[Auth] Perfil offline/restrito');
    }
  }, []);

  // Reload Manual
  const reloadCurrentUser = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      await reload(user);
      const token = await user.getIdToken(true); // Força refresh do token

      const updatedUser = { ...auth.currentUser };
      setCurrentUser(updatedUser);

      if (updatedUser.emailVerified) {
        try {
          await updateDoc(doc(db, 'users_public', user.uid), {
            verified: true,
          });
          await fetchUserProfile(user.uid);
        } catch (e) {
          /* ignore */
        }
      }
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [fetchUserProfile]);

  const loginWithEmail = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- AQUI ESTAVA O ERRO ---
  const registerWithEmail = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // [CORREÇÃO CRUCIAL]
      // Antes estava: url: window.location.origin (mandava para a Home)
      // Agora mandamos direto para a página que lê o código:
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };

      await sendEmailVerification(user, actionCodeSettings);

      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? { ...user } : null);
      if (user && user.emailVerified) {
        await fetchUserProfile(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    loginWithEmail,
    registerWithEmail,
    logout,
    reloadCurrentUser,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
