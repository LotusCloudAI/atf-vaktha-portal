"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import SubscribeButton from "../../components/billing/SubscribeButton";

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
              title: data.title || "Untitled Speech",
              audioUrl: data.audioUrl || null,
              status: data.status || "processing",
              transcript: data.transcript || null,

              words: data.words ?? 0,
              fillerWords: data.fillerWords ?? 0,
              speedWPM: data.speedWPM ?? 0,

              totalScore: data.totalScore ?? 0,
              clarityScore: data.clarityScore ?? 0,
              confidenceScore: data.confidenceScore ?? 0,

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

      unsubProgress = onSnapshot(
        doc(db, "userProgress", user.uid),
        (docSnap) => {
          setProgress(docSnap.exists() ? docSnap.data() : null);
        }
      );

      unsubRecs = onSnapshot(
        doc(db, "userRecommendations", user.uid),
        (docSnap) => {
          setRecommendations(docSnap.exists() ? docSnap.data() : null);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubSpeeches?.();
      unsubProgress?.();
      unsubRecs?.();
    };
  }, []);

  // NOT LOGGED IN
  if (!userLoaded && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          Please login to view your dashboard.
        </p>
      </div>
    );
  }

  // LOADING
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

      {/* PROGRESS */}
      <section className="mb-8">
        <ProgressPanel data={progress} />
      </section>

      {/* RECOMMENDATIONS */}
      <section className="mb-8">
        <RecommendationsPanel data={recommendations} />
      </section>

      {/* SPEECHES */}
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

      {/* STRIPE SECTION */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-bold mb-4">
          Upgrade Your Plan
        </h2>

        <div className="flex gap-4">

          {/* PRO PLAN */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold">Pro Plan</h3>
            <p className="text-sm mb-2">$19/month</p>
            <SubscribeButton priceId="price_1TUVqaCf8UadXOBqcGll7Ipz" />
          </div>

          {/* ELITE PLAN */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold">Elite Plan</h3>
            <p className="text-sm mb-2">$49/month</p>
            <SubscribeButton priceId="price_1TUVtcCf8UadXOBqWTRIX9fD" />
          </div>

        </div>
      </div>
    </main>
  );
}