"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/");
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminName(userSnap.data().name);
        setLoading(false);
      } catch (error) {
        console.error("Admin check error:", error);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-blue-700">
        Admin Dashboard
      </h1>

      <p className="mt-4 text-gray-700">
        Welcome, {adminName}
      </p>
    </main>
  );
}