// src/store/authStore.js

import { create } from 'zustand';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification, // <-- 1. IMPORTAÇÃO ADICIONADA
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const useAuthStore = create((set) => ({
    user: null,
    isAuthReady: false,
    isLoading: false,
    error: null,

    registerWithEmail: async (email, password, additionalData) => {
        set({ isLoading: true, error: null });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // --- 2. LINHA ADICIONADA ---
            // Envia o e-mail de verificação para o usuário recém-criado
            await sendEmailVerification(firebaseUser);
            // ---------------------------

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

    // O resto do seu authStore (loginWithEmail, loginWithGoogle, etc.) permanece igual...
    loginWithEmail: async (email, password) => {
        // ...código existente
    },
    loginWithGoogle: async () => {
        // ...código existente
    },
    logout: async () => {
        // ...código existente
    },
    fetchUser: () => {
        // ...código existente
    },
}));

export default useAuthStore;