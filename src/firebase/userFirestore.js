// src/firebase/userFirestore.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Salva o tema do usuário (dark/light) no Firestore, tratando erros de permissão de forma silenciosa.
 * @param {string} uid - UID do usuário.
 * @param {string} theme - "dark" | "light"
 * @returns {Promise<void>}
 */
export async function saveUserTheme(uid, theme) {
  if (!uid || !["dark", "light"].includes(theme)) {
    console.warn("[OLLO userFirestore] UID ou tema inválido para salvar. UID:", uid, "Tema:", theme);
    return;
  }
  try {
    await setDoc(doc(db, "users", uid), { theme }, { merge: true });
    // (Opcional) console.log(`[OLLO userFirestore] Tema '${theme}' salvo para usuário ${uid}.`);
  } catch (err) {
    // Silencia erro de permissão para anônimos ou não autorizados
    if (
      err.code === "permission-denied" ||
      (typeof err.message === "string" && err.message.toLowerCase().includes("permission"))
    ) {
      // (Opcional) console.warn("[OLLO userFirestore] Permissão negada ao salvar tema:", uid, theme);
      return;
    }
    // Outros erros devem ser exibidos
    console.error(
      `[OLLO userFirestore] Erro inesperado ao salvar tema de ${uid}:`,
      err.code,
      err.message,
      err
    );
    throw err; // Repasse só erros inesperados para tratamento externo
  }
}

/**
 * Busca o tema do usuário no Firestore, tratando erros de permissão de forma silenciosa.
 * @param {string} uid - UID do usuário.
 * @returns {Promise<string|null>} - "dark", "light" ou null.
 */
export async function fetchUserTheme(uid) {
  if (!uid) {
    console.warn("[OLLO userFirestore] UID ausente ao buscar tema.");
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
    // Silencia erro de permissão para anônimos ou não autorizados
    if (
      err.code === "permission-denied" ||
      (typeof err.message === "string" && err.message.toLowerCase().includes("permission"))
    ) {
      // (Opcional) console.warn("[OLLO userFirestore] Permissão negada ao buscar tema:", uid);
      return null;
    }
    // Outros erros devem ser exibidos
    console.error(
      `[OLLO userFirestore] Erro inesperado ao buscar tema do Firestore (UID: ${uid}):`,
      err.code,
      err.message,
      err
    );
    throw err;
  }
}
