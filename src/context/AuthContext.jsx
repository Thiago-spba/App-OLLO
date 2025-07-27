// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  // IMPORTANTE: Trocamos onAuthStateChanged por onIdTokenChanged para evitar a race condition
  onIdTokenChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createUserProfile } from '../services/firestoreService';

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

  // MUDANÇA CRÍTICA: Usando onIdTokenChanged para garantir que o token esteja pronto
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Precisamos buscar de AMBAS as coleções agora
          const privateDocRef = doc(db, 'users', firebaseUser.uid);
          const publicDocRef = doc(db, 'users_public', firebaseUser.uid);

          const [privateDocSnap, publicDocSnap] = await Promise.all([
            getDoc(privateDocRef),
            getDoc(publicDocRef),
          ]);

          let finalUserData;

          // Se o perfil PÚBLICO não existir, consideramos que é um novo usuário ou um login antigo
          if (!publicDocSnap.exists()) {
            console.warn(
              `[OLLO] Perfil não encontrado para ${firebaseUser.uid}. Criando perfil padrão.`
            );
            // Prepara os dados iniciais para o novo perfil
            const defaultProfileData = {
              email: firebaseUser.email,
              name:
                firebaseUser.displayName || firebaseUser.email.split('@')[0],
              username: `user_${firebaseUser.uid.substring(0, 5)}`, // Gera um username único inicial
            };

            // O serviço agora cuida da criação de ambos os perfis
            finalUserData = await createUserProfile(
              firebaseUser.uid,
              defaultProfileData
            );
          } else {
            // Se existir, mesclamos os dados dos dois documentos
            finalUserData = {
              ...privateDocSnap.data(),
              ...publicDocSnap.data(),
            };
          }

          // Define o currentUser com os dados do Auth e do Firestore mesclados
          setCurrentUser({
            ...firebaseUser,
            ...finalUserData,
          });
        } catch (error) {
          console.error(
            '[OLLO] Erro CRÍTICO ao buscar/criar perfil no Firestore:',
            error
          );
          // O erro que você via acontecerá aqui. Se ele sumir, o problema foi resolvido.
          // Se o perfil falhar, logamos apenas com os dados basicos do Auth.
          setCurrentUser(firebaseUser);
          toast.error('Houve um erro ao carregar seu perfil.');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    // Nenhuma mudança necessária aqui
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
    // Nenhuma mudança necessária aqui
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

  // MUDANÇA: Atualizado para a nova arquitetura
  const registerWithEmail = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: additionalData.name });

      // O serviço createUserProfile já faz tudo o que precisamos
      await createUserProfile(user.uid, {
        email: user.email,
        name: additionalData.name,
        username: additionalData.username,
      });

      await sendEmailVerification(user);
      return { success: true, user };
    } catch (error) {
      console.error('[OLLO] Erro no registro:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (email) => {
    // Nenhuma mudança necessária aqui
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error);
      return { success: false, error };
    }
  };

  // Nenhuma mudança necessária aqui
  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithEmail,
      logout,
      registerWithEmail,
      resetPassword,
    }),
    [currentUser, loading, loginWithEmail, logout] // useCallback remove a necessidade de outras dependências
  );

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
