// src/firebase/auth.js

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

/**
 * Realiza login com email e senha via Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function loginWithEmail(email, password) {
  if (!email || !password) {
    throw new Error('[OLLO] Email e senha são obrigatórios para login.');
  }
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('[OLLO] Erro no login:', error);
    throw error;
  }
}

/**
 * Registra um novo usuário com email e senha via Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function registerWithEmail(email, password) {
  if (!email || !password) {
    throw new Error('[OLLO] Email e senha são obrigatórios para registro.');
  }
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('[OLLO] Erro no registro:', error);
    throw error;
  }
}

/*
  [OLLO] Centraliza as funções de autenticação, com validação, logs e tratamento de erros.
  Ideal para ser usado por componentes React, hooks ou contextos de autenticação.
*/
