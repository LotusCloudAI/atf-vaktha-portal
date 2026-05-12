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

import { signOut } from "firebase/auth";

import SpeechCard from "../../components/dashboard/SpeechCard";
import ProgressPanel from "../../components/dashboard/ProgressPanel";
import RecommendationsPanel from "../../components/dashboard/RecommendationsPanel";

export default function DashboardPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);

  // ===============================
  // 🔥 AUTH + DATA LISTENERS
  // ===============================
  useEffect(() => {
    let unsubSpeeches: Unsubscribe | null = null;
    let unsubProgress: Unsubscribe | null = null;
    let unsubRecs: Unsubscribe | null = null;
    let unsubUser: Unsubscribe | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setUserLoaded(false);
        setLoading(false);
        window.location.href = "/";
        return;
      }

      setUserLoaded(true);

      // 🔥 USER SUBSCRIPTION
      unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        const data = docSnap.data();
        setSubscription(data?.subscription || null);
      });

      // 🔥 SPEECHES
      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubSpeeches = onSnapshot(q, (snap) => {
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
      });

      // 🔥 PROGRESS
      unsubProgress = onSnapshot(
        doc(db, "userProgress", user.uid),
        (docSnap) => {
          setProgress(docSnap.exists() ? docSnap.data() : null);
        }
      );

      // 🔥 RECOMMENDATIONS
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
      unsubUser?.();
    };
  }, []);

  // ===============================
  // 🔥 LOGOUT
  // ===============================
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  // ===============================
  // 🔥 BILLING PORTAL (FIXED)
  // ===============================
  const handleManageBilling = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        return;
      }

      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Portal error:", data);
        alert("Unable to open billing portal");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Billing portal error:", err);
    }
  };

  // ===============================
  // 🔥 PREMIUM CHECK
  // ===============================
  const isPremium =
    subscription?.status === "active" &&
    subscription?.plan === "premium";

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          My Speaking Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* PLAN STATUS */}
      {isPremium ? (
        <div className="mb-6 p-4 bg-green-100 border rounded">
          <p className="text-green-800 font-semibold">
            Premium Active — Full access unlocked
          </p>

          <button
            onClick={handleManageBilling}
            className="mt-3 px-4 py-2 bg-black text-white rounded"
          >
            Manage Billing
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-100 border rounded">
          <p className="text-yellow-800 font-semibold">
            Free Plan — Limited Access
          </p>
        </div>
      )}

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

        {!isPremium ? (
          <div className="bg-yellow-50 border rounded p-6 text-center">
            <p className="font-semibold">Upgrade Required</p>
            <p className="text-sm text-gray-600 mt-2">
              Upgrade to unlock full speech analytics and history
            </p>
          </div>
        ) : speeches.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed rounded p-10 text-center">
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

      {/* STRIPE SUBSCRIBE */}
      {!isPremium && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-bold mb-4">
            Upgrade Your Plan
          </h2>

          <div className="flex gap-4">
            <div className="border p-4 rounded">
              <h3 className="font-semibold">Pro Plan</h3>
              <p className="text-sm mb-2">$19/month</p>
              <SubscribeButton priceId="price_1TUVqaCf8UadXOBqcGll7Ipz" />
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold">Elite Plan</h3>
              <p className="text-sm mb-2">$49/month</p>
              <SubscribeButton priceId="price_1TUVtcCf8UadXOBqWTRIX9fD" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}