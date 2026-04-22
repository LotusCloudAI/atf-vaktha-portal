"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
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
    const loadData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setUserLoaded(false);
          setLoading(false);
          return;
        }

        setUserLoaded(true);

        // FETCH SPEECHES
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snap = await getDocs(q);

        const speechData = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // SORT (LATEST FIRST)
        speechData.sort(
          (a: any, b: any) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setSpeeches(speechData);

        // FETCH PROGRESS
        const progressDoc = await getDoc(doc(db, "userProgress", user.uid));
        if (progressDoc.exists()) {
          setProgress(progressDoc.data());
        }

        // FETCH RECOMMENDATIONS
        const recDoc = await getDoc(
          doc(db, "userRecommendations", user.uid)
        );

        if (recDoc.exists()) {
          setRecommendations(recDoc.data());
        }

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // AUTH NOT READY
  if (!userLoaded && !loading) {
    return (
      <div className="p-6 text-center">
        Please login to view your dashboard.
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        My Speaking Dashboard
      </h1>

      {/* PROGRESS */}
      <ProgressPanel data={progress} />

      {/* RECOMMENDATIONS */}
      <RecommendationsPanel data={recommendations} />

      {/* SPEECH LIST */}
      {speeches.length === 0 ? (
        <p>No speeches uploaded yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {speeches.map(s => (
            <SpeechCard key={s.id} speech={s} />
          ))}
        </div>
      )}

    </main>
  );
}
