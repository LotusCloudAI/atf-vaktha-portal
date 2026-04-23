"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return; // prevent multiple clicks

    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error("User not returned from Google login");
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🟢 CREATE USER IF NOT EXISTS
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

      // 🟢 ROUTE BASED ON ROLE
      const role = userSnap.data()?.role || "member";

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Login error:", error);

      // 🔴 HANDLE COMMON AUTH ERRORS CLEANLY
      if (error.code === "auth/popup-closed-by-user") {
        console.warn("User closed popup");
      } else if (error.code === "auth/cancelled-popup-request") {
        console.warn("Popup request cancelled (multiple clicks)");
      } else {
        alert("Login failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`mt-6 px-6 py-2 rounded-lg text-white ${
        loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}