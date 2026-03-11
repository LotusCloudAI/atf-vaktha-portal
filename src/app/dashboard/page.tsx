"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.replace("/");
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) return <div className="p-10">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-blue-700">
        Member Dashboard
      </h1>

      <p className="mt-4 text-gray-700">
        Welcome, {user?.displayName}
      </p>
    </main>
  );
}