"use client";

import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { loginWithGoogle } from "@/lib/auth";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();

      if (!user) {
        alert("Login failed");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Create user if not exists
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "member",
          createdAt: serverTimestamp(),
        });

        router.push("/dashboard");
        return;
      }

      // Existing user → role-based routing
      const role = userSnap.data().role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      alert(error.message || "Login failed");
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