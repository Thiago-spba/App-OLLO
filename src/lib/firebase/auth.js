import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';

/**
 * Realiza login com email e senha via Firebase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function loginWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}
