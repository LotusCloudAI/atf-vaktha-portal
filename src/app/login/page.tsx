"use client";

import { auth, googleProvider, db } from "../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {

  const handleLogin = async () => {
    try {
      // 🔥 1. Google Login Popup
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      if (!user) {
        alert("Login failed");
        return;
      }

      // 🔥 2. CHECK USER IN FIRESTORE
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 🔥 3. CREATE USER IF NOT EXISTS
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "user",

          // 🔥 IMPORTANT FOR BILLING FLOW
          subscription: {
            status: "inactive",
            plan: "free",
          },

          createdAt: new Date(),
        });
      }

      // 🔥 4. REDIRECT TO DASHBOARD
      window.location.href = "/dashboard";

    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error.message || "Login failed");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">

      <div className="bg-white shadow p-8 rounded text-center w-[350px]">

        <h1 className="text-2xl font-bold mb-6">
          Login to ATF Vaktha
        </h1>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full"
        >
          Login with Google
        </button>

      </div>

    </main>
  );
}