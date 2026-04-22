import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration
 * ATF VAKTHA - FINAL FIXED CONFIG
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,

  
  storageBucket: "atf-vaktha.firebasestorage.app",

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

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
 * ✅ Storage (correct initialization)
 * DO NOT pass bucket again — config already contains it
 */
export const storage = getStorage( 
  app,
  "gs://atf-vaktha.firebasestorage.app"
);


export default app;

/**
 * Debug (browser only)
 */
if (typeof window !== "undefined") {
  console.log("🔥 Firebase Config:", {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}