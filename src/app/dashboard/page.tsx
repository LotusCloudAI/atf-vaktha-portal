"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Speech = {
  id: string;
  score?: number;
  speedWPM?: number;
  fillerWords?: number;
  createdAt?: any;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "speeches"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const speeches: Speech[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Speech[];

      setData(speeches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const avgScore =
    data.reduce((sum, s) => sum + (s.score || 0), 0) /
    (data.length || 1);

  const avgWPM =
    data.reduce((sum, s) => sum + (s.speedWPM || 0), 0) /
    (data.length || 1);

  if (loading) {
    return <div className="p-10 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="p-8 md:p-12 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          AI insights into your speaking performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">

        <div className="bg-white p-6 rounded-2xl shadow border">
          <p className="text-gray-500 text-sm">Total Speeches</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {data.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <p className="text-gray-500 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {Math.round(avgScore)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border">
          <p className="text-gray-500 text-sm">Average Speed</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {Math.round(avgWPM)} WPM
          </p>
        </div>

      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow border mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Score Progress Over Time
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="id" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow border">

        <h2 className="text-xl font-semibold mb-4">
          Speech Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Speech</th>
                <th>Score</th>
                <th>Speed</th>
                <th>Filler Words</th>
              </tr>
            </thead>

            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.id}</td>
                  <td>{s.score ?? "-"}</td>
                  <td>{s.speedWPM ?? "-"}</td>
                  <td>{s.fillerWords ?? "-"}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}