import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Read environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Debug check (will show in browser console)
if (typeof window !== "undefined") {
  console.log("Firebase Config Loaded:", {
    apiKey: firebaseConfig.apiKey ? "OK" : "MISSING",
    authDomain: firebaseConfig.authDomain ? "OK" : "MISSING",
    projectId: firebaseConfig.projectId ? "OK" : "MISSING",
  });
}

// ✅ Prevent re-initializing Firebase in Next.js
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);