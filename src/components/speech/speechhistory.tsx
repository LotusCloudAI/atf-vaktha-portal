"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase"; // Using the path that worked for you previously
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import Link from "next/link";

interface Speech {
  id: string;
  title: string;
  status: string;
  createdAt: any;
}

export default function SpeechHistory() {
  const [history, setHistory] = useState<Speech[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5) // SECTION 7 Requirement: Last 5 speeches
      );

      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Speech)));
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold mb-4">Recent Speech History</h3>
      <div className="space-y-4">
        {history.map((speech) => (
          <div key={speech.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-0">
            <div>
              <p className="font-medium text-gray-800">{speech.title}</p>
              <p className="text-xs text-gray-500">
                {speech.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                speech.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {speech.status}
              </span>

              {/* View Transcript Button */}
              <Link href={`/dashboard/analytics`}>
                <button className="text-sm text-blue-600 hover:underline font-medium">
                  View Transcript
                </button>
              </Link>
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="text-gray-400 text-sm">No recent activity.</p>}
      </div>
    </div>
  );
}