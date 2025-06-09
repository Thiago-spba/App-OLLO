// src/firebase.js

// 1. Importe as funções necessárias
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 2. Cole aqui o objeto de configuração que você copiou do site do Firebase
// TODO: Idealmente, essas chaves deveriam estar em variáveis de ambiente (.env)
const firebaseConfig = {
  apiKey: "AIzaSyA2LBsiciRmvrPYOcIxUOt1UEgw2R5cUe4",
  authDomain: "ollo-app-e5224.firebaseapp.com",
  projectId: "ollo-app-e5224",
  storageBucket: "ollo-app-e5224.appspot.com",
  messagingSenderId: "194763296569",
  appId: "1:194763296569:web:4c8db85f88b235a11322e8"
};

// 3. Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// 4. Exporte os serviços do Firebase que vamos usar na nossa aplicação
// Estamos exportando o Firestore DB por enquanto
export const db = getFirestore(app);

// Futuramente, descomentaremos estas linhas:
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// export const auth = getAuth(app);
// export const storage = getStorage(app);