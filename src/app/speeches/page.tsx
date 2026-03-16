"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface Speech {
  id: string;
  title: string;          
  status: string;
  createdAt?: any;
}


export default function SpeechesPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpeeches = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "speeches"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const speechData: Speech[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Speech, "id">),
        }));

        setSpeeches(speechData);
      } catch (err) {
        console.error("Error fetching speeches:", err);
        setError("Failed to load speeches.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpeeches();
  }, []);

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Speeches</h1>

      {loading && <p>Loading speeches...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && speeches.length === 0 && (
        <p className="text-gray-500">
          No speeches found. Upload your first speech to get started.
        </p>
      )}

      {speeches.map((speech) => (
        <div
          key={speech.id}
          className="border rounded-lg p-4 mb-4 shadow-sm"
        >
          <h2 className="font-semibold text-lg">
            {speech.title || "Untitled Speech"}
          </h2>
          <p className="text-sm text-gray-600">
            Status: {speech.status || "Pending"}
          </p>
        </div>
      ))}
    </main>
  );
}