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

  // 🔥 IMPORTANT FIX — FORCE CORRECT BUCKET
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "atf-vaktha.firebasestorage.app",
  // CRITICAL FIX — FORCE CORRECT BUCKET
  storageBucket: "atf-vaktha.firebasestorage.app",

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * Debug (only in browser)
 */
if (typeof window !== "undefined") {
  console.log("🔥 Firebase Config:", {
 * Debug (Browser only)
 */
if (typeof window !== "undefined") {
  console.log("Firebase Config:", {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

/**
 * Initialize Firebase safely
 */
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * Firebase Services
 * Prevent re-init (Next.js safe)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Services
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 🔥 IMPORTANT: Ensure correct bucket is used
export const storage = getStorage(app, firebaseConfig.storageBucket);
// IMPORTANT — use same app
export const storage = getStorage(app);

export default app;
