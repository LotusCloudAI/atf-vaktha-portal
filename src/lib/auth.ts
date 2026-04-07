import { signInWithPopup, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export const loginWithGoogle = async () => {
  try {
    // Persist login session
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Login success:", result.user);

    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};