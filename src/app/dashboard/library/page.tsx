"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LibraryPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeeches = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSpeeches(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeeches();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Speeches</h1>

      {loading && <p>Loading...</p>}

      {!loading && speeches.length === 0 && (
        <p>No speeches found</p>
      )}

      {speeches.map((speech) => (
        <div key={speech.id} className="bg-white shadow-md rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold">{speech.title}</h2>

          <audio controls className="w-full mt-2">
            <source src={speech.audioUrl} />
          </audio>
        </div>
      ))}
    </main>
  );
}