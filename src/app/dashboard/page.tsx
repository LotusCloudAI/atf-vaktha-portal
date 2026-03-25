"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardPage() {

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        let speechList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const avgScore =
    speeches.reduce((sum, s) => sum + (s.analytics?.score || 0), 0) /
    (speeches.length || 1);

  if (checking) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

      {/* Stats Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Total Speeches
          </p>
          <p className="text-4xl font-bold text-blue-600 mt-1">
            {speeches.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Average Score
          </p>
          <p className="text-4xl font-bold text-green-600 mt-1">
            {Math.round(avgScore)}%
          </p>
        </div>
      </div>

      {speeches.length === 0 && (
        <p className="mt-10 text-gray-500 italic">
          No data available. Upload a speech to see your progress!
        </p>
      )}
    </main>
  );
}