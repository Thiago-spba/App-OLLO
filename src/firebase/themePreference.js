import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../context/firebase/config"; // <-- Caminho correto!

export async function saveUserTheme(uid, theme) {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, "users", uid),
      { theme },
      { merge: true }
    );
  } catch (err) {
    console.error("Erro ao salvar tema no Firestore:", err);
  }
}

export async function fetchUserTheme(uid) {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().theme || null;
    }
    return null;
  } catch (err) {
    console.error("Erro ao buscar tema do Firestore:", err);
    return null;
  }
}
