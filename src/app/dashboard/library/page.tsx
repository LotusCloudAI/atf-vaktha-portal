"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Speech {
  id: string;
  title?: string;
  audioUrl?: string;
  createdAt?: any;
}

export default function SpeechLibrary() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeeches = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const list: Speech[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Speech, "id">),
      }));

      setSpeeches(list);
      setLoading(false);
    };

    fetchSpeeches();
  }, []);

  if (loading) {
    return <p className="p-10">Loading speeches...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">
        Speech Library
      </h1>

      {speeches.length === 0 ? (
        <p>No speeches uploaded yet.</p>
      ) : (
        speeches.map((speech) => (
          <div key={speech.id} className="bg-white shadow p-5 mb-4">
            <h3 className="font-semibold">{speech.title}</h3>

            {speech.audioUrl && (
              <audio controls className="mt-3 w-full">
                <source src={speech.audioUrl} />
              </audio>
            )}
          </div>
        ))
      )}
    </main>
  );
}