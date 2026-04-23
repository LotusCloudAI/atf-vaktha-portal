"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import AnalyticsCard from "../../../components/dashboard/AnalyticsCard";
import AICoachPanel from "../../../components/dashboard/AICoachPanel";
import SectionAnalysis from "../../../components/dashboard/SectionAnalysis";
import ScoreBars from "../../../components/dashboard/ScoreBars";
import TranscriptViewer from "../../../components/dashboard/TranscriptViewer";

interface Speech {
  id: string;
  title?: string;
  status?: string;
  audioUrl?: string;
  createdAt?: any;

  overallScore?: number;
  transcript?: string;

  metrics?: {
    words?: number;
    wpm?: number;
    fillerWords?: number;
    clarityScore?: number;
  };

  // ✅ Phase 8 AI structure
  aiFeedback?: {
    strengths?: string[];
    suggestions?: string[];
    weaknesses?: string[];
  };
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

            overallScore: d.overallScore || 0,
            transcript: d.transcript || "",

            metrics: d.metrics || {},

            // ✅ Correct Phase 8 mapping
            aiFeedback: d.aiFeedback || {
              strengths: [],
              suggestions: [],
              weaknesses: [],
            },
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
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading analytics...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-atfBlue mb-8">
          ATF Vaktha Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard title="Total Speeches" value={speeches.length} />
        </div>

        {speeches.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 text-lg">
              No speeches available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {speech.title}
                </h2>

                <p className="text-xs text-gray-500 mb-4">
                  ID: {speech.id.slice(0, 6)}
                </p>

                {/* ✅ METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Words</p>
                    <p className="font-semibold">
                      {speech.metrics?.words || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">WPM</p>
                    <p className="font-semibold">
                      {speech.metrics?.wpm || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Filler Words</p>
                    <p className="font-semibold">
                      {speech.metrics?.fillerWords || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className="font-semibold text-green-600">
                      {speech.overallScore && speech.overallScore > 0
                        ? speech.overallScore
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* ✅ AI COMPONENTS — FINAL ORDER */}
                <div className="mt-4 space-y-4">

                  {/* 1. AI Coach */}
                  <AICoachPanel data={speech} />

                  {/* 2. Transcript (NEW) */}
                  <TranscriptViewer transcript={speech.transcript} />

                  {/* 3. Section Analysis */}
                  <SectionAnalysis data={speech} />

                  {/* 4. Score Bars */}
                  <ScoreBars data={speech} />

                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </main>
  );
}