"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardPage() {

  const [speeches, setSpeeches] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const speechList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSpeeches(speechList);

      } catch (error) {
        console.error("Error loading speeches:", error);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <p>Total Speeches: {speeches.length}</p>
    </main>
  );
}