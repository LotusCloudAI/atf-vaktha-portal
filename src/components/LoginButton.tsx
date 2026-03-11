"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // If user does not exist, create as member
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "member",
          createdAt: new Date(),
        });

        router.push("/dashboard");
        return;
      }

      // If user exists, route based on role
      const role = userSnap.data().role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
    >
      Sign in with Google
    </button>
  );
}