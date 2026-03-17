"use client";

import { useEffect, useState } from "react";
import { getAllClubs } from "../../lib/services/clubService";
import { Club } from "../../lib/types/club";

export default function ClubDiscoveryPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllClubs();
      setClubs(data as Club[]);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Clubs...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Discover Clubs</h1>
      
      {/* Grid Layout - Task 8/Section 8 requirement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-blue-700">{club.clubName}</h2>
            <p className="text-slate-600 mt-2">📍 Location ID: {club.cityId}</p>
            <p className="text-slate-500 text-sm italic">🌐 {club.language}</p>
            
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Join Club
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}