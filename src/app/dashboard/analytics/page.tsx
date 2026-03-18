"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";

interface Speech {
  id: string;
  title?: string;
  status?: string;
  audioUrl?: string;
  createdAt?: any;

  speechScore?: number;
  words?: number;
  speedWPM?: number;
  fillerWords?: number;
  vocabularyScore?: number;
  transcript?: string;
}

export default function AnalyticsPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSpeeches([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data: Speech[] = snapshot.docs.map((doc) => {
          const d = doc.data();

          return {
            id: doc.id,
            title: d.title || "Untitled Speech",
            status: d.status || "",
            audioUrl: d.audioUrl || "",
            createdAt: d.createdAt || null,
            speechScore: d.speechScore || 0,
            words: d.words || 0,
            speedWPM: d.speedWPM || 0,
            fillerWords: d.fillerWords || 0,
            vocabularyScore: d.vocabularyScore || 0,
            transcript: d.transcript || "",
          };
        });

        setSpeeches(data);

      } catch (error) {
        console.error("Error fetching speeches:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <main className="p-10">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-8">
          Speech Analytics
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Speeches"
            value={speeches.length}
          />
        </div>

        {/* List */}
        {speeches.length === 0 ? (
          <p className="text-gray-600">
            No speeches available.
          </p>
        ) : (
          <div className="space-y-6">
            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="bg-white p-6 rounded-xl shadow border"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {speech.title}
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  ID: {speech.id.slice(0, 6)}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnalyticsCard title="Words" value={speech.words ?? 0} />
                  <AnalyticsCard title="WPM" value={speech.speedWPM ?? 0} />
                  <AnalyticsCard title="Filler Words" value={speech.fillerWords ?? 0} />
                  <AnalyticsCard title="Score" value={speech.speechScore ?? 0} />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}