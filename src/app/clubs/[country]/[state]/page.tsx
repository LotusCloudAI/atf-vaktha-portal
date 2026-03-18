"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClubsByState } from "../../../../lib/services/clubService";
import { Club } from "../../../../lib/types/club";

export default function StateClubPage() {
  const params = useParams();
  const countryId = params.country as string;
  const stateId = params.state as string;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Logic from Task 4: Display clubs within a specific state
      const data = await getClubsByState(countryId, stateId);
      setClubs(data as Club[]);
      setLoading(false);
    };

    if (countryId && stateId) {
      fetch();
    }
  }, [countryId, stateId]);

  if (loading) return <div className="p-10 text-center">Loading {stateId} Clubs...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900 capitalize">
          {stateId.replace("-", " ")} Clubs
        </h1>
        <p className="text-slate-500 mt-2">
          Country: <span className="uppercase">{countryId}</span>
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
            <h2 className="text-xl font-bold text-blue-700">{club.clubName}</h2>
            <p className="text-slate-600 mt-2">🏙️ City: {club.cityId}</p>
            <p className="text-slate-500 text-sm mt-1">🗓️ Meetings: {club.meetingDay}</p>
            
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              View Club Details
            </button>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl shadow-inner">
          <p className="text-slate-500 italic">No clubs registered in {stateId} yet.</p>
        </div>
      )}
    </main>
  );
}