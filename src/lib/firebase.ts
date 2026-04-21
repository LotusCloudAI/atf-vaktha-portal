import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration
 * ATF VAKTHA - FIREBASE CLIENT CONFIG (FINAL FIXED)
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  // CRITICAL FIX — FORCE CORRECT BUCKET FOR PHASE 3
  storageBucket: "atf-vaktha.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * Debug (only in browser)
 */
if (typeof window !== "undefined") {
  console.log("🔥 Firebase Config:", {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

/**
 * Initialize Firebase safely (Next.js hot-reload safe)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Services
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

/**
 * Cloud Storage 
 * Explicitly passing the storageBucket to ensure compatibility with Cloud Functions
 */
export const storage = getStorage(app, firebaseConfig.storageBucket);

export default app;