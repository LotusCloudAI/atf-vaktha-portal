import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration
 * Loaded from environment variables
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Debug check (browser only)
 */
if (typeof window !== "undefined") {
  console.log("Firebase Config Loaded:", {
    apiKey: firebaseConfig.apiKey ? "OK" : "MISSING",
    authDomain: firebaseConfig.authDomain ? "OK" : "MISSING",
    projectId: firebaseConfig.projectId ? "OK" : "MISSING",
  });
}

/**
 * Prevent reinitializing Firebase in Next.js
 */

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * Export Firebase services
 */

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export const storage = getStorage(app);