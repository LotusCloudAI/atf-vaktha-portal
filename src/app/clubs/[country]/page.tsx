"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClubsByCountry } from "../../../lib/services/clubService";
import { Club } from "../../../lib/types/club";

export default function CountryClubPage() {
  const params = useParams();
  const countryId = params.country as string; // Grabs 'usa' or 'india' from URL

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilteredClubs = async () => {
      // Logic from Task 3: Filter clubs by countryId
      const data = await getClubsByCountry(countryId);
      setClubs(data as Club[]);
      setLoading(false);
    };

    if (countryId) {
      fetchFilteredClubs();
    }
  }, [countryId]);

  if (loading) return <div className="p-10 text-center">Loading {countryId} Clubs...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 capitalize">
          Clubs in {countryId}
        </h1>
        <p className="text-slate-500 mt-2">Browse all local chapters in this country.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-blue-700">{club.clubName}</h2>
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-sm text-slate-600">📍 State: {club.stateId}</span>
              <span className="text-sm text-slate-600">🌐 Language: {club.language}</span>
            </div>
            
            <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              View Club Details
            </button>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">No clubs found in {countryId} yet.</p>
        </div>
      )}
    </main>
  );
}