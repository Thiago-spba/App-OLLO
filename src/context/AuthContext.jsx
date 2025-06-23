// src/context/AuthContext.jsx

import { auth, db } from '../firebase'; // <-- ESTE IMPORT RESOLVE O ERRO
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Cria o contexto de autenticação
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const navigate = useNavigate();

  // REF para evitar loops infinitos
  const profileCheckRef = useRef(false);

  // Helper para URL base do app
  const getBaseUrl = () => {
    return import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_APP_URL || window.location.origin
      : window.location.origin;
  };

  // Função para checar se o perfil está completo
  const isProfileComplete = (userData) => {
    if (!userData) return false;
    return (
      typeof userData.name === 'string' &&
      userData.name.trim().length > 1 &&
      typeof userData.location === 'string' &&
      userData.location.trim().length > 1
    );
  };

  // Função separada para checagem de perfil (chamada apenas quando necessário)
  const checkAndRedirectProfile = (userObj) => {
    const completo = isProfileComplete(userObj);
    setProfileIncomplete(!completo);

    // Só redireciona se perfil incompleto E não estiver já na página de perfil
    if (
      !completo &&
      !window.location.pathname.includes('/profile') &&
      !profileCheckRef.current
    ) {
      profileCheckRef.current = true;
      toast.info('Complete seu perfil para acessar o OLLO.');
      navigate('/profile', { replace: true });
      // Reset o ref após um tempo para permitir futuras checagens se necessário
      setTimeout(() => {
        profileCheckRef.current = false;
      }, 1000);
    }
  };

  // EFEITO PRINCIPAL - SÓ ESCUTA AUTENTICAÇÃO, SEM DEPENDÊNCIA DE LOCATION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          let userData;
          if (docSnap.exists()) {
            userData = docSnap.data();
          } else {
            // Cria documento se não existir (novo usuário)
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Usuário OLLO',
              username: firebaseUser.email.split('@')[0],
              bio: 'Novo membro da comunidade OLLO!',
              avatarUrl:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  firebaseUser.email.split('@')[0]
                )}&background=4f46e5&color=fff&bold=true`,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              location: '', // Inicia com localização vazia
            };
            await setDoc(userDocRef, userData);
          }

          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            ...userData,
          };

          setCurrentUser(userObj);

          // Checa perfil completo apenas na primeira carga
          checkAndRedirectProfile(userObj);
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          toast.error('Erro ao carregar dados do usuário');
          setCurrentUser(null);
          setProfileIncomplete(true);
        }
      } else {
        setCurrentUser(null);
        setProfileIncomplete(false);
        profileCheckRef.current = false; // Reset na saída
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // SEM DEPENDÊNCIAS DE LOCATION - essa era a causa do problema!

  // ========== FUNÇÕES DE AUTENTICAÇÃO ==========

  const registerWithEmail = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: additionalData.name,
      });

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: additionalData.name,
        username: additionalData.username.toLowerCase(),
        bio: additionalData.bio || 'Novo membro da comunidade OLLO!',
        avatarUrl:
          additionalData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            additionalData.name
          )}&background=4f46e5&color=fff&bold=true`,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        location: '',
      });

      await sendEmailVerification(firebaseUser, {
        url: `${getBaseUrl()}/login?email_verified=true`,
        handleCodeInApp: false,
      });

      toast.success('Conta criada! Verifique seu email.');
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error(error.message);
      return { success: false, error };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

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

  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('Nenhum usuário logado');

      if (updates.name || updates.avatarUrl) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name || currentUser.name,
          photoURL: updates.avatarUrl || currentUser.avatarUrl,
        });
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updates);

      const updatedUser = {
        ...currentUser,
        ...updates,
      };

      setCurrentUser(updatedUser);

      // Recheca se o perfil ficou completo após a atualização
      const isComplete = isProfileComplete(updatedUser);
      setProfileIncomplete(!isComplete);

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
    profileIncomplete,
    registerWithEmail,
    loginWithEmail,
    logout,
    forgotPassword,
    updateUserProfile,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
