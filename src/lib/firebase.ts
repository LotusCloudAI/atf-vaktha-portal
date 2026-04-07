import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Config
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: "atf-vaktha.firebasestorage.app", // ✅ MUST match Firebase console EXACTLY
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * Initialize App (single instance)
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Services
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Providers
 */
export const googleProvider = new GoogleAuthProvider();

/**
 * 🔥 CRITICAL — Persist login (FIXES YOUR ISSUE)
 */
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence enabled");
  })
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

/**
 * Debug
 */
if (typeof window !== "undefined") {
  console.log("🔥 Firebase Initialized:", {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}