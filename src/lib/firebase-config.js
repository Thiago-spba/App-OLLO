import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2LBsicRmvrPYOcIxUOt1UEgw2R5cUe4",
  authDomain: "ollo-app-e5224.firebaseapp.com",
  projectId: "ollo-app-e5224",
  storageBucket: "ollo-app-e5224.appspot.com",
  messagingSenderId: "194763296569",
  appId: "1:194763296569:web:4c8d8d85f88b235a11322e8"
};

// ✅ Verifica se já existe um app antes de inicializar
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
