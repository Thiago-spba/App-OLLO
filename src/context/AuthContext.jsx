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
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'; // Adicionei updateDoc
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

      // --- DEBUG OLLO ---
      console.log(
        'DEBUG OLLO AuthContext: onAuthStateChanged - firebaseUser:',
        firebaseUser
      );
      if (firebaseUser) {
        console.log(
          'DEBUG OLLO AuthContext: firebaseUser.uid:',
          firebaseUser.uid
        );
      }
      // --- FIM DEBUG OLLO ---

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          console.log(
            'DEBUG OLLO AuthContext: userDocRef path:',
            userDocRef.path
          );

          const docSnap = await getDoc(userDocRef);
          let userDataFromFirestore = {};

          if (docSnap.exists()) {
            userDataFromFirestore = docSnap.data();
            // Opcional: Atualizar timestamp de último login ou outros campos se desejar
            // Exemplo:
            // await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
          } else {
            // Se o documento do usuário não existe no Firestore, crie-o.
            // Isso é essencial para usuários que se cadastraram antes de ter essa lógica,
            // ou se o documento foi deletado manualmente.
            console.log(
              `[OLLO] Criando documento de perfil para ${firebaseUser.uid} (usuário recém-logado/migrado/sem perfil).`
            );
            await setDoc(
              userDocRef,
              {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName:
                  firebaseUser.displayName || firebaseUser.email.split('@')[0], // Define um display name padrão
                photoURL: firebaseUser.photoURL || '',
                bio: '',
                username: '', // Adicione outros campos padrão que seu perfil possui
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                emailVerified: firebaseUser.emailVerified,
              },
              { merge: true }
            ); // Use merge:true para garantir que não apaga outros campos se o doc for parcialmente criado

            // Após criar, obtenha os dados para garantir que currentUser esteja completo
            const newDocSnap = await getDoc(userDocRef);
            userDataFromFirestore = newDocSnap.data();
          }

          // Combina dados do Auth e do Firestore
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userDataFromFirestore, // Os dados do Firestore complementam/substituem os do Auth se existirem
          });
        } catch (error) {
          console.error(
            '[OLLO] Erro ao buscar ou criar perfil do usuário no Firestore:',
            error
          );
          // Em caso de erro grave no Firestore, ainda tentamos definir o currentUser
          // com os dados do Auth para que o app não quebre completamente.
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        // --- DEBUG OLLO ---
        console.log(
          'DEBUG OLLO AuthContext: Nenhum usuário autenticado (firebaseUser é null).'
        );
        // --- FIM DEBUG OLLO ---
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Dependência vazia, pois onAuthStateChanged já é um listener externo

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
      console.error('[OLLO] Erro no login:', error); // Adicionei log aqui também
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
    } catch (error) {
      // Capture o erro para logar
      console.error('[OLLO] Erro no logout:', error); // Adicionei log aqui
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

      // --- DEBUG OLLO ---
      console.log(
        'DEBUG OLLO AuthContext: Tentando setDoc para users/',
        user.uid
      );
      // --- FIM DEBUG OLLO ---

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
      console.error('[OLLO] Erro no registro:', error); // Adicionei log aqui
      return { success: false, error };
    }
  };

  // Reset de senha
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('[OLLO] Erro no reset de senha:', error); // Adicionei log aqui
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
          <div className="w-16 h-16 border-4 border-ollo-accent-light border-t-transparent rounded-full animate-spin" />
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
