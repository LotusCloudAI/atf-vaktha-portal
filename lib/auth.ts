import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If user does NOT exist → create
    if (!userSnap.exists()) {

      // TEMP LOGIC: first user becomes admin
      const role = "employee"; // change to "admin" manually for your UID if needed

      await setDoc(userRef, {
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
      });

      console.log("User created with role:", role);
    } else {
      console.log("User already exists");
    }

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};