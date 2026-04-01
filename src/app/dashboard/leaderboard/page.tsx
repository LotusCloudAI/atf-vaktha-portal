"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase"; 
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";

export default function LeaderboardPage() {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [level, setLevel] = useState("Global"); // Levels: Global, Country, State, Club
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const transcriptsRef = collection(db, "transcripts");
        let q;

        // TASK-14: Conditional queries based on the selected tab
        if (level === "Global") {
          q = query(transcriptsRef, orderBy("score", "desc"), limit(10));
        } 
        else if (level === "Club") {
          // Replace "YOUR_CLUB_ID" with the actual logged-in user's club ID variable
          q = query(transcriptsRef, where("clubId", "==", "YOUR_CLUB_ID"), orderBy("score", "desc"), limit(10));
        } 
        else if (level === "State") {
          // Set to CT for local development testing
          q = query(transcriptsRef, where("state", "==", "CT"), orderBy("score", "desc"), limit(10));
        } 
        else if (level === "Country") {
          // Set to USA for local development testing
          q = query(transcriptsRef, where("country", "==", "USA"), orderBy("score", "desc"), limit(10));
        }

        if (q) {
            const snapshot = await getDocs(q);
            setSpeakers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        // Handled silently per Section 8, but logging during dev is helpful for missing index errors
        console.error("Firestore Error:", error); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [level]);

  return (
    <div className="w-full max-w-4xl mx-auto pb-10 pt-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase">
          Leaderboard
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Top performing speakers across the platform.</p>
      </header>

      {/* Task 14 Requirement: Leaderboard Levels */}
      <div className="flex justify-center gap-2 mb-10 bg-slate-200 p-1 rounded-2xl w-fit mx-auto">
        {["Global", "Country", "State", "Club"].map((tab) => (
          <button
            key={tab}
            onClick={() => setLevel(tab)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              level === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {speakers.map((speaker, index) => (
          <div 
            key={speaker.id} 
            className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
              index === 0 ? "bg-yellow-50 border-yellow-200 scale-105 shadow-xl shadow-yellow-100" : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-6">
              <span className={`text-2xl font-black ${index === 0 ? "text-yellow-600" : "text-slate-300"}`}>
                #{index + 1}
              </span>
              <div>
                <p className="font-bold text-slate-900 text-lg">Member {speaker.userUid?.slice(0, 6)}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {speaker.clubId || "Independent"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">{speaker.score || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</p>
            </div>
          </div>
        ))}

        {loading && <p className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">Calculating Rankings...</p>}
      </div>
    </div>
  );
}