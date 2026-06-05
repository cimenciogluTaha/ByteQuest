// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmLlvp4zlQzM_HjwMZD7T6EWYnwOzcpqk",
  authDomain: "bytequest-20a09.firebaseapp.com",
  projectId: "bytequest-20a09",
  storageBucket: "bytequest-20a09.firebasestorage.app",
  messagingSenderId: "838405379509",
  appId: "1:838405379509:web:205cdd396f95f4b1acf5fc",
  measurementId: "G-40TFYLHBQR"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exports
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics initialization for iframe environments
export const analyticsPromise = isSupported().then((supported) => {
  if (supported) {
    return getAnalytics(app);
  }
  return null;
}).catch((err) => {
  console.warn("Analytics not supported or blocked in this environment:", err);
  return null;
});

export default app;
