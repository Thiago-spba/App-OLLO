// src/store/authStore.js
import { create } from 'zustand';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const useAuthStore = create((set) => ({
    // ---- ESTADO INICIAL ----
    user: null,          // Armazena os dados do usuário logado
    isAuthReady: false,  // Fica true quando o estado inicial é verificado
    isLoading: false,    // Para feedback de UI (spinners, etc.)
    error: null,         // Para mensagens de erro

    // ---- AÇÕES (Nossa API interna de autenticação) ----

    // Ação: Cadastro com Email e Senha
    registerWithEmail: async (email, password, additionalData) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

            const docSnap = await getDoc(userDocRef);
            set({ user: { uid: firebaseUser.uid, ...docSnap.data() }, isLoading: false, isAuthReady: true });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Ação: Login com Email e Senha
    loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // O listener onAuthStateChanged vai cuidar de atualizar o estado do usuário
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Ação: Login com Google
    loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Verifica se o usuário já existe no nosso Firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);

            // Se o usuário não existir, cria um novo documento para ele
            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    username: firebaseUser.email.split('@')[0], // username simples
                    bio: 'Novo membro do OLLO!',
                    avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName)}&background=0D1B2A&color=E0E1DD&bold=true`,
                    createdAt: serverTimestamp(),
                });
            }
            // O listener onAuthStateChanged vai cuidar de atualizar o estado
            set({ isLoading: false });
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Ação: Logout
    logout: async () => {
        set({ isLoading: true });
        await signOut(auth);
        set({ user: null, isLoading: false }); // Limpa o usuário imediatamente
    },

    // Ação: Listener para o estado de autenticação
    // Esta função será chamada uma vez no App.jsx para manter tudo sincronizado
    fetchUser: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuário está logado, busca dados do Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    set({ user: { uid: firebaseUser.uid, ...docSnap.data() }, isAuthReady: true });
                } else {
                    // Caso raro: usuário existe no Auth mas não no Firestore.
                    // Poderíamos criar o doc aqui ou simplesmente deslogar. Por enquanto, deslogamos.
                    await signOut(auth);
                    set({ user: null, isAuthReady: true });
                }
            } else {
                // Usuário está deslogado
                set({ user: null, isAuthReady: true });
            }
        });
    },
}));

export default useAuthStore;