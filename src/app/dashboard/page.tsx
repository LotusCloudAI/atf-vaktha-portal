"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  doc,
  onSnapshot,
  Unsubscribe,
  orderBy,
} from "firebase/firestore";

import SpeechCard from "../../components/dashboard/SpeechCard";
import ProgressPanel from "../../components/dashboard/ProgressPanel";
import RecommendationsPanel from "../../components/dashboard/RecommendationsPanel";

export default function DashboardPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    let unsubSpeeches: Unsubscribe | null = null;
    let unsubProgress: Unsubscribe | null = null;
    let unsubRecs: Unsubscribe | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserLoaded(false);
        setLoading(false);
        return;
      }

      setUserLoaded(true);

      // ✅ SPEECHES LISTENER (FIXED + ORDERED)
      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubSpeeches = onSnapshot(
        q,
        (snap) => {
          const speechData = snap.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,

              // ✅ SAFE DEFAULTS (CRITICAL)
              title: data.title || "Untitled Speech",
              audioUrl: data.audioUrl || null,
              status: data.status || "processing",
              transcript: data.transcript || null,

              // ✅ METRICS (FLAT STRUCTURE)
              words: data.words ?? 0,
              fillerWords: data.fillerWords ?? 0,
              speedWPM: data.speedWPM ?? 0,

              // ✅ SCORES
              totalScore: data.totalScore ?? 0,
              clarityScore: data.clarityScore ?? 0,
              confidenceScore: data.confidenceScore ?? 0,

              // ✅ FEEDBACK
              feedback: data.feedback || null,

              createdAt: data.createdAt || null,
              error: data.error || null,
            };
          });

          setSpeeches(speechData);
          setLoading(false);
        },
        (error) => {
          console.error("Speeches Listener Error:", error);
          setLoading(false);
        }
      );

      // ✅ PROGRESS
      unsubProgress = onSnapshot(
        doc(db, "userProgress", user.uid),
        (docSnap) => {
          setProgress(docSnap.exists() ? docSnap.data() : null);
        }
      );

      // ✅ RECOMMENDATIONS
      unsubRecs = onSnapshot(
        doc(db, "userRecommendations", user.uid),
        (docSnap) => {
          setRecommendations(docSnap.exists() ? docSnap.data() : null);
        }
      );
    });

    // ✅ CLEANUP (IMPORTANT)
    return () => {
      unsubscribeAuth();
      unsubSpeeches?.();
      unsubProgress?.();
      unsubRecs?.();
    };
  }, []);

  // ❌ NOT LOGGED IN
  if (!userLoaded && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          Please login to view your dashboard.
        </p>
      </div>
    );
  }

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        My Speaking Dashboard
      </h1>

      {/* ✅ PROGRESS */}
      <section className="mb-8">
        <ProgressPanel data={progress} />
      </section>

      {/* ✅ RECOMMENDATIONS */}
      <section className="mb-8">
        <RecommendationsPanel data={recommendations} />
      </section>

      {/* ✅ SPEECHES */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Recent Speeches
        </h2>

        {speeches.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed rounded-lg p-10 text-center">
            <p className="text-gray-500">
              No speeches uploaded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {speeches.map((s) => (
              <SpeechCard key={s.id} speech={s} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}