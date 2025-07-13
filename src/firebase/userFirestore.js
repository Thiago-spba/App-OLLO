// src/firebase/userFirestore.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Cria ou atualiza o perfil do usuário no Firestore.
 * @param {string} userId - UID do usuário do Firebase Auth.
 * @param {object} profileData - Dados do perfil (name, username, bio, avatarUrl, etc).
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, profileData) {
  if (!userId || typeof profileData !== "object") {
    throw new Error("Dados de usuário inválidos para salvar perfil.");
  }
  const userRef = doc(db, "users", userId);

  try {
    await setDoc(userRef, profileData, { merge: true });
    console.log(`[OLLO] Perfil do usuário ${userId} salvo/atualizado no Firestore.`);
  } catch (error) {
    console.error(`[OLLO] Erro ao salvar perfil de ${userId}:`, error);
    throw error;
  }
}

/**
 * Salva o tema do usuário (dark/light) no Firestore.
 * @param {string} uid - UID do usuário.
 * @param {string} theme - "dark" | "light"
 * @returns {Promise<void>}
 */
export async function saveUserTheme(uid, theme) {
  if (!uid || !["dark", "light"].includes(theme)) {
    console.warn("[OLLO] UID ou tema inválido para salvar.");
    return;
  }
  try {
    await setDoc(doc(db, "users", uid), { theme }, { merge: true });
    console.log(`[OLLO] Tema '${theme}' salvo para usuário ${uid}.`);
  } catch (err) {
    console.error(`[OLLO] Erro ao salvar tema de ${uid}:`, err);
  }
}

/**
 * Busca o tema do usuário no Firestore.
 * @param {string} uid - UID do usuário.
 * @returns {Promise<string|null>} - "dark", "light" ou null.
 */
export async function fetchUserTheme(uid) {
  if (!uid) {
    console.warn("[OLLO] UID ausente ao buscar tema.");
    return null;
  }
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().theme || null;
    }
    return null;
  } catch (err) {
    console.error(`[OLLO] Erro ao buscar tema do Firestore (UID: ${uid}):`, err);
    return null;
  }
}
