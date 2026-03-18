"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "../../../lib/firebase"; // Added for Task 9
import { collection, addDoc } from "firebase/firestore"; // Added for Task 9
import { getClubById, getClubMembers, getClubSpeeches } from "../../../lib/services/clubService";

export default function IndividualClubPage() {
  const { clubId } = useParams();
  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const id = clubId as string;
      const [clubData, memberData, speechData] = await Promise.all([
        getClubById(id),
        getClubMembers(id),
        getClubSpeeches(id)
      ]);

      setClub(clubData);
      setMembers(memberData);
      setSpeeches(speechData);
      setLoading(false);
    };

    if (clubId) fetchAllData();
  }, [clubId]);

  // TASK-9 Logic: Member Join Club System
  const handleJoinClub = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      alert("Please log in to join a club.");
      return;
    }

    try {
      await addDoc(collection(db, "members"), {
        userUid: user.uid,
        clubId: clubId,
        name: user.displayName || "New Member",
        email: user.email,
        role: "member" // Standard role for new joiners
      });
      alert("You have successfully joined the club!");
      
      // Refresh member list after joining
      const updatedMembers = await getClubMembers(clubId as string);
      setMembers(updatedMembers);
    } catch (error) {
      // Errors handled silently as per Section 8 requirements
    }
  };

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Loading Club Profile...</div>;
  if (!club) return <div className="p-10 text-center text-red-500 font-bold">Club not found.</div>;

  return (
    <main className="p-6 md:p-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Club Header Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900">{club.clubName}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-slate-600 font-medium">
              <span>📍 {club.cityId}, {club.stateId}</span>
              <span>🗓️ Meets {club.meetingDay}</span>
              <span>🌐 {club.language}</span>
            </div>
          </div>

          {/* TASK-9: Join Button */}
          <button 
            onClick={handleJoinClub}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            Join Club
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Members</h2>
            <ul className="space-y-3">
              {members.map((m) => (
                <li key={m.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50">
                  <span className="font-medium text-slate-700">{m.name}</span>
                  <span className="text-[10px] uppercase bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold tracking-tighter">
                    {m.role}
                  </span>
                </li>
              ))}
              {members.length === 0 && <p className="text-slate-400 text-xs italic">No members yet.</p>}
            </ul>
          </div>

          {/* Recent Speeches Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Recent Activity</h2>
            <div className="space-y-4">
              {speeches.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <p className="font-bold text-slate-800">{s.title || "Untitled Speech"}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Speaker ID: {s.userUid.slice(0,8)}</p>
                </div>
              ))}
              {speeches.length === 0 && <p className="text-slate-400 italic py-4">No recent speeches recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}