"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import AnalyticsCard from "@/components/dashboard/AnalyticsCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Speech {
  id: string;
  title?: string;
  audioUrl?: string;
  createdAt?: any;

  score: number;
  words: number;
  speedWPM: number;
  fillerWords: number;
  clarityScore?: number;
  confidenceScore?: number;
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
          const d: any = doc.data();

          return {
            id: doc.id,
            title: d.title || "Untitled Speech",
            audioUrl: d.audioUrl || "",
            createdAt: d.createdAt || null,

            // 🔥 Handles ALL formats
            score:
              d.score ??
              d.speechScore ??
              d.totalScore ??
              d.analytics?.score ??
              0,

            words:
              d.words ??
              d.analytics?.words ??
              0,

            speedWPM:
              d.speedWPM ??
              d.analytics?.wpm ??
              0,

            fillerWords:
              d.fillerWords ??
              d.analytics?.fillerCount ??
              0,

            clarityScore: d.clarityScore ?? 0,
            confidenceScore: d.confidenceScore ?? 0,
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

  const avgScore =
    speeches.reduce((sum, s) => sum + (s.score || 0), 0) /
    (speeches.length || 1);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-atfBlue mb-8">
          ATF Vaktha Analytics
        </h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <AnalyticsCard title="Total Speeches" value={speeches.length} />
          <AnalyticsCard title="Average Score" value={Math.round(avgScore)} />
        </div>

        {/* CHARTS */}
        <div className="space-y-10 mb-10">

          {/* SCORE TREND */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Score Trend</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={speeches}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SPEED */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Speaking Speed (WPM)</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speeches}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="speedWPM" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FILLER WORDS */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Filler Words</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speeches}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="fillerWords" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* SPEECH LIST */}
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
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {speech.title}
                </h2>

                <p className="text-xs text-gray-500 mb-4">
                  ID: {speech.id.slice(0, 6)}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Words</p>
                    <p className="font-semibold">{speech.words}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">WPM</p>
                    <p className="font-semibold">{speech.speedWPM}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Filler</p>
                    <p className="font-semibold">{speech.fillerWords}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Score</p>
                    <p className="font-semibold text-green-600">
                      {speech.score}
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