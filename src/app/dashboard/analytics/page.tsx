"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase"; // ✅ FIXED PATH
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import AnalyticsCard from "../../../components/dashboard/AnalyticsCard"; // ✅ FIXED PATH

interface Speech {
  id: string;
  title?: string;
  status?: string;
  audioUrl?: string;
  createdAt?: any;

  score?: number;
  words?: number;
  wpm?: number;
  fillerWords?: number;

  transcript?: string;
}

export default function AnalyticsPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSpeeches([]);
        setLoading(false);
        return;
      }

      try {
        // ✅ PRIMARY QUERY (WITH ORDER)
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const data: Speech[] = snapshot.docs.map((doc) => {
              const d = doc.data();

              return {
                id: doc.id,
                title: d.title || "Untitled Speech",
                status: d.status || "processing",
                audioUrl: d.audioUrl || "",
                createdAt: d.createdAt || null,

                score: d.score ?? 0,
                words: d.words ?? 0,
                wpm: d.wpm ?? 0,
                fillerWords: d.fillerWords ?? 0,

                transcript: d.transcript || "",
              };
            });

            console.log("🔥 REALTIME UPDATE:", data);

            setSpeeches(data);
            setLoading(false);
          },

          // 🔥 CRITICAL: INDEX FALLBACK HANDLING
          (error) => {
            console.error("🔥 Snapshot Error:", error);

            console.log("⚠️ Falling back (no orderBy)");

            const fallbackQuery = query(
              collection(db, "speeches"),
              where("userUid", "==", user.uid)
            );

            unsubscribeFirestore = onSnapshot(fallbackQuery, (snapshot) => {
              let data: Speech[] = snapshot.docs.map((doc) => {
                const d = doc.data();

                return {
                  id: doc.id,
                  title: d.title || "Untitled Speech",
                  status: d.status || "processing",
                  audioUrl: d.audioUrl || "",
                  createdAt: d.createdAt || null,

                  score: d.score ?? 0,
                  words: d.words ?? 0,
                  wpm: d.wpm ?? 0,
                  fillerWords: d.fillerWords ?? 0,

                  transcript: d.transcript || "",
                };
              });

              // ✅ MANUAL SORT (IMPORTANT)
              data = data.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.seconds - a.createdAt.seconds;
              });

              console.log("⚠️ FALLBACK DATA:", data);

              setSpeeches(data);
              setLoading(false);
            });
          }
        );
      } catch (error) {
        console.error("Error initializing listener:", error);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // ✅ LOADING
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

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-atfBlue mb-8">
          ATF Vaktha Analytics
        </h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Speeches"
            value={speeches.length}
          />
        </div>

        {/* EMPTY */}
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
                {/* TITLE */}
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {speech.title}
                </h2>

                {/* ID */}
                <p className="text-xs text-gray-500 mb-4">
                  ID: {speech.id.slice(0, 6)}
                </p>

                {/* METRICS */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Words</p>
                    <p className="font-semibold">{speech.words ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">WPM</p>
                    <p className="font-semibold">{speech.wpm ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Filler Words</p>
                    <p className="font-semibold">{speech.fillerWords ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className="font-semibold text-green-600">
                      {speech.score ?? 0}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <p
                  className={`mt-4 text-xs font-semibold ${
                    speech.status === "completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  Status: {speech.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}