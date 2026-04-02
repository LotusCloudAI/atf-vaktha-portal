"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type Speech = {
  id: string;
  words?: number;
  fillerWords?: number;
  speedWPM?: number;
  score?: number;
  clarityScore?: number;
  confidenceScore?: number;
};

export default function DashboardPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userId", "==", user.uid) // IMPORTANT FIX
        );

        const snapshot = await getDocs(q);

        const data: Speech[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Speech[];

        setSpeeches(data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const avgScore =
    speeches.reduce((sum, s) => sum + (s.score || 0), 0) /
    (speeches.length || 1);

  if (loading) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-white border rounded shadow">
          <p>Total Speeches</p>
          <p className="text-2xl font-bold">{speeches.length}</p>
        </div>

        <div className="p-6 bg-white border rounded shadow">
          <p>Average Score</p>
          <p className="text-2xl font-bold">
            {Math.round(avgScore)}%
          </p>
        </div>
      </div>

      {/* Speech List */}
      {speeches.length === 0 ? (
        <p>No speeches uploaded yet.</p>
      ) : (
        speeches.map((s) => (
          <div key={s.id} className="border p-4 mb-4">
            <p>Score: {s.score || "Processing..."}</p>
            <p>Words: {s.words || "-"}</p>
            <p>Filler Words: {s.fillerWords || "-"}</p>
            <p>Speed (WPM): {s.speedWPM || "-"}</p>
            <p>Clarity: {s.clarityScore || "-"}</p>
            <p>Confidence: {s.confidenceScore || "-"}</p>
          </div>
        ))
      )}
    </div>
  );
}