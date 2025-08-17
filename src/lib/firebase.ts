// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCddOENPTXZIyOLhJa-rLWbiDQ9x3aH5eQ",
  authDomain: "agendamento-salao-538ed.firebaseapp.com",
  projectId: "agendamento-salao-538ed",
  storageBucket: "agendamento-salao-538ed.appspot.com",
  messagingSenderId: "769533480790",
  appId: "1:769533480790:web:11567b96105d72b5d510f7",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
