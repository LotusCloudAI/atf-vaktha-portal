"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DashboardPage() {
  const [speechCount, setSpeechCount] = useState(0);
  const [recentSpeeches, setRecentSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        let speechList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort latest first (safe optional chaining)
        speechList.sort((a: any, b: any) => {
          return (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0);
        });

        if (isMounted) {
          setSpeechCount(snapshot.size);
          setRecentSpeeches(speechList.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500 animate-pulse">
          Loading dashboard...
        </p>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Summary */}
          <div className="bg-white shadow-md border border-gray-100 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total Speeches
            </h2>
            <p className="text-4xl font-bold text-blue-600">
              {speechCount}
            </p>
          </div>

          {/* Recent Speeches */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Recent Speeches
            </h2>

            {recentSpeeches.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
                <p className="text-gray-500">
                  No speeches found. Start by creating one!
                </p>
              </div>
            ) : (
              recentSpeeches.map((speech) => (
                <div
                  key={speech.id}
                  className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 mb-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-md font-semibold text-gray-700">
                    {speech.title || "Untitled Speech"}
                  </h3>

                  {speech?.createdAt?.seconds && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        speech.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}