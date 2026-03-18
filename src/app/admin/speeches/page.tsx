"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function AdminSpeechMonitoring() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSpeeches = async () => {
      try {
        // TASK-13: Admin sees all uploaded speeches across the platform
        const q = query(collection(db, "transcripts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setSpeeches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        // Handled silently per Section 8
      } finally {
        setLoading(false);
      }
    };
    fetchAllSpeeches();
  }, []);

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Speech Monitoring</h1>
          <p className="text-slate-500">Overview of all member activity and speech uploads.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600">Speech Title</th>
                <th className="p-4 font-bold text-slate-600">Member ID</th>
                <th className="p-4 font-bold text-slate-600">Club ID</th>
                <th className="p-4 font-bold text-slate-600">Upload Date</th>
                <th className="p-4 font-bold text-slate-600 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {speeches.map((speech) => (
                <tr key={speech.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-blue-700">{speech.title || "Untitled Speech"}</td>
                  <td className="p-4 text-slate-600">{speech.userUid?.slice(0, 12)}...</td>
                  <td className="p-4 text-slate-600 font-mono text-xs">{speech.clubId || "Global"}</td>
                  <td className="p-4 text-slate-500">
                    {speech.createdAt?.toDate ? speech.createdAt.toDate().toLocaleDateString() : "Pending"}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                      Uploaded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="p-20 text-center text-slate-400 animate-pulse font-medium">
              Scanning platform for speeches...
            </div>
          )}
          
          {!loading && speeches.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic">
              No speeches have been uploaded to the platform yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}