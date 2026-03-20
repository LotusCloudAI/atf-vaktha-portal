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

  // ✅ Loading UI
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading analytics...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* 🔥 Title */}
        <h1 className="text-3xl font-bold text-atfBlue mb-8">
          ATF Vaktha Analytics
        </h1>

        {/* 📊 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Speeches"
            value={speeches.length}
          />
        </div>

        {/* 📭 Empty State */}
        {speeches.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 text-lg">
              No speeches available yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition"
              >
                {/* 🎤 Title */}
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {speech.title}
                </h2>

                {/* 🆔 ID */}
                <p className="text-xs text-gray-500 mb-4">
                  ID: {speech.id.slice(0, 6)}
                </p>

                {/* 📈 Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Words</p>
                    <p className="font-semibold">{speech.words ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">WPM</p>
                    <p className="font-semibold">{speech.speedWPM ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Filler Words</p>
                    <p className="font-semibold">{speech.fillerWords ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className="font-semibold text-green-600">
                      {speech.speechScore ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}