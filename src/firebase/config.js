// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2LBsiciRmvrPYOcIxUOt1UEgw2R5cUe4",
  authDomain: "ollo-app-e5224.firebaseapp.com",
  projectId: "ollo-app-e5224",
  storageBucket: "ollo-app-e5224.appspot.com",
  messagingSenderId: "194763296569",
  appId: "1:194763296569:web:4c8db85f88b235a11322e8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;