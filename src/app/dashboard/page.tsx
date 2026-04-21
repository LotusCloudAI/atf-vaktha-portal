"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import TranscriptViewer from "../../components/TranscriptViewer";

type Speech = {
  id: string;
  transcript?: string;
  analytics?: {
    score?: number;
  };
  [key: string]: any;
};

export default function DashboardPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const speechList: Speech[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMounted) {
          setSpeeches(speechList);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (isMounted) setError("Failed to load speeches");
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Processing your speeches...
      </div>
    );
  }

  const avgScore =
    speeches.reduce((sum, s) => sum + (s.analytics?.score || 0), 0) /
    (speeches.length || 1);

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

      {/* Speeches List */}
      <div className="mt-12 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Transcripts</h2>
        <div className="space-y-6">
          {speeches.map((speech) => (
            <div key={speech.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-gray-400">ID: {speech.id}</span>
                {speech.analytics?.score && (
                  <span className="text-sm font-bold text-green-600">Score: {speech.analytics.score}%</span>
                )}
              </div>
              
              <TranscriptViewer transcript={speech.transcript || "No transcript available."} />
            </div>
          ))}
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