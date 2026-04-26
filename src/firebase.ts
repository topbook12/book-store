import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCL8eEq2iaXLmLydtW_bnlnFcvZPf5_Kbo",
  authDomain: "ice-document.firebaseapp.com",
  projectId: "ice-document",
  storageBucket: "ice-document.firebasestorage.app",
  messagingSenderId: "127910229860",
  appId: "1:127910229860:web:79f2bea0952f3daee46c71",
  measurementId: "G-DYMBSRG683"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Default database

export default app;
