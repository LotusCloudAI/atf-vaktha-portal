import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
<<<<<<< HEAD
 * Firebase Configuration
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,

  // 🔥 IMPORTANT FIX — FORCE CORRECT BUCKET
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "atf-vaktha.firebasestorage.app",

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * Debug (only in browser)
 */
if (typeof window !== "undefined") {
  console.log("🔥 Firebase Config:", {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
=======
 * ATF VAKTHA - FIREBASE CLIENT CONFIG
 * This file initializes the Firebase SDK for the frontend.
 * Merged with Google Auth Provider and debug logging.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Debug check (browser only)
 * Logs whether environment variables are correctly loaded.
 */
if (typeof window !== "undefined") {
  console.log("Firebase Config Status:", {
    apiKey: firebaseConfig.apiKey ? "OK" : "MISSING",
    authDomain: firebaseConfig.authDomain ? "OK" : "MISSING",
    projectId: firebaseConfig.projectId ? "OK" : "MISSING",
    storageBucket: firebaseConfig.storageBucket ? "OK" : "MISSING",
>>>>>>> origin/feature/backend-ai
  });
}

/**
<<<<<<< HEAD
 * Initialize Firebase safely
 */
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();
=======
 * Prevent reinitializing Firebase in Next.js (HMR support)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
>>>>>>> origin/feature/backend-ai

/**
 * Firebase Services
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

<<<<<<< HEAD
// 🔥 IMPORTANT: Ensure correct bucket is used
export const storage = getStorage(app, firebaseConfig.storageBucket);
=======
export default app;
>>>>>>> origin/feature/backend-ai
