"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import PerformanceMetrics from "../../../components/analytics/performancemetrics";

interface Transcript {
  id: string;
  text: string;
  wordCount: number;
  fillerWords: number;
  wpm: number;
  userUid: string;
}

export default function AnalyticsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "transcripts"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transcript[];

        setTranscripts(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="p-4 md:p-10 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading Analytics...</p>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Review your communication metrics and filler word usage.
          </p>
        </header>

        {transcripts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No transcripts available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {transcripts.map((item) => (
              <section
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    Transcript Details
                  </h2>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                    ID: {item.id.slice(0, 5)}
                  </span>
                </div>

                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r-lg mb-8 italic text-slate-700 leading-relaxed">
                  "{item.text}"
                </blockquote>

                <PerformanceMetrics
                  wordCount={item.wordCount}
                  fillerWordCount={item.fillerWords}
                  wpm={item.wpm}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}