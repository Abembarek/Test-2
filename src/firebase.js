import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQj5IwjzRsfhPG9hZLGmuTVpwXpjLzO6Y",
  authDomain: "signingapp-cd7e9.firebaseapp.com",
  projectId: "signingapp-cd7e9",
  storageBucket: "signingapp-cd7e9.appspot.com",
  messagingSenderId: "10005893203",
  appId: "1:10005893203:web:62229cf20d61fea21a76a6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
