"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
} from "firebase/storage";

/**
 * Firebase Configuration
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
 * Initialize Firebase (safe for Next.js)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Services
 */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

/**
 * ✅ STORAGE (CLEAN — no duplicate bucket)
 */
export const storage = getStorage(app);

/**
 * 🔥 EMULATOR CONNECTION (DEV ONLY)
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  try {
    // AUTH
    connectAuthEmulator(auth, "http://127.0.0.1:9099");

    // FIRESTORE
    connectFirestoreEmulator(db, "127.0.0.1", 8080);

    // STORAGE ✅ CRITICAL FIX
    connectStorageEmulator(storage, "127.0.0.1", 9199);

    console.log("🔥 Connected to Firebase Emulators");
  } catch (err) {
    console.warn("⚠️ Emulator connection already initialized");
  }
}

/**
 * Export app
 */
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