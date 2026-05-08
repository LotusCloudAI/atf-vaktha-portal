"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "user",
          createdAt: serverTimestamp(),
        });
      }

      // Redirect to dashboard
      router.push("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        
        <h1 className="text-4xl font-bold text-blue-700">
          ATF Vaktha Portal
        </h1>

        <p className="text-gray-600">
          Leadership • Communication • Confidence
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

      </div>
    </main>
  );
}