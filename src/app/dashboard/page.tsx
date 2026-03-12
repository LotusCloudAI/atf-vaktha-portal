"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [speechCount, setSpeechCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const q = query(
            collection(db, "speeches"),
            where("userUid", "==", firebaseUser.uid)
          );
          const snapshot = await getDocs(q);
          setSpeechCount(snapshot.size);
        } catch (error) {
          console.error("Error fetching speech count:", error);
        }

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
      
      <p className="mt-4 font-semibold">
        Total Speeches: <span className="text-blue-600">{speechCount}</span>
      </p>
    </main>
  );
}