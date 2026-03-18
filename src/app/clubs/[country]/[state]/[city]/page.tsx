"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClubsByCity } from "../../../../../lib/services/clubService";
import { Club } from "../../../../../lib/types/club";

export default function CityClubPage() {
  const params = useParams();
  const { country, state, city } = params;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getClubsByCity(
        country as string, 
        state as string, 
        city as string
      );
      setClubs(data as Club[]);
      setLoading(false);
    };

    if (country && state && city) {
      fetch();
    }
  }, [country, state, city]);

  if (loading) return <div className="p-10 text-center">Finding clubs in {city}...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <nav className="text-sm text-slate-500 mb-4 uppercase tracking-widest">
        {country} / {state} / {city}
      </nav>
      
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 capitalize">
          {city} Clubs
        </h1>
        <p className="text-lg text-slate-600 mt-2">
          Join a local ATF Vaktha chapter and start your leadership journey.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <h2 className="text-2xl font-bold text-blue-800">{club.clubName}</h2>
            
            <div className="mt-4 space-y-2">
              <p className="text-slate-600 flex items-center gap-2">
                <span>🕒</span> {club.meetingDay}s at {club.meetingTime}
              </p>
              <p className="text-slate-600 flex items-center gap-2">
                <span>🗣️</span> {club.language}
              </p>
            </div>
            
            <button className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-blue-200 shadow-lg transition-transform active:scale-95">
              Visit Club Page
            </button>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No clubs found in this city yet. Be the first to start one!</p>
        </div>
      )}
    </main>
  );
}