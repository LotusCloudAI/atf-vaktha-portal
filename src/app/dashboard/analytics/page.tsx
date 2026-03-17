"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Speech[];

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

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-8">
          Speech Analytics
        </h1>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Speeches"
            value={speeches.length}
          />
        </div>

        {/* Speech List */}
        {speeches.length === 0 ? (

          <p className="text-gray-600">
            No speeches found.
          </p>

        ) : (

          speeches.map((speech) => (

            <div
              key={speech.id}
              className="bg-white shadow rounded p-6 mb-6"
            >

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800">
                {speech.title}
              </h3>

              {/* Audio Player */}
              {speech.audioUrl && (
                <audio controls className="mt-4 w-full">
                  <source src={speech.audioUrl} />
                </audio>
              )}

              {/* Upload Date */}
              {speech.createdAt && (
                <p className="text-sm text-gray-500 mt-3">
                  Uploaded: {speech.createdAt?.toDate?.().toLocaleString?.()}
                </p>
              )}

              {/* Status */}
              {speech.status && (
                <p className="text-sm text-gray-600 mt-1">
                  Status: {speech.status}
                </p>
              )}

              {/* Analytics Section */}
              {speech.speechScore !== undefined && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">

                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p className="text-xs text-gray-500">Speech Score</p>
                    <p className="text-lg font-bold">{speech.speechScore}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p className="text-xs text-gray-500">Words</p>
                    <p className="text-lg font-bold">{speech.words}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p className="text-xs text-gray-500">Speed</p>
                    <p className="text-lg font-bold">{speech.speedWPM} WPM</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p className="text-xs text-gray-500">Filler Words</p>
                    <p className="text-lg font-bold">{speech.fillerWords}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded text-center">
                    <p className="text-xs text-gray-500">Vocabulary</p>
                    <p className="text-lg font-bold">{speech.vocabularyScore}</p>
                  </div>

                </div>
              )}

              {/* Transcript */}
              {speech.transcript && (
                <div className="bg-gray-50 p-4 rounded mt-6">
                  <h4 className="font-semibold mb-2">
                    Speech Transcript
                  </h4>
                  <p className="text-sm text-gray-700">
                    {speech.transcript}
                  </p>
                </div>
              )}

            </div>

          ))

        )}

      </div>

    </main>

  );

}