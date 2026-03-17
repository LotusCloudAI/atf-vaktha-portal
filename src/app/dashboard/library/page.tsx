"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SpeechLibrary() {
  const [speeches, setSpeeches] = useState<any[]>([]);

  useEffect(() => {
    const fetchSpeeches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSpeeches(list);
    };

    fetchSpeeches();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">Speech Library</h1>

      {speeches.length === 0 && (
        <p className="text-gray-500">No speeches available.</p>
      )}

      {speeches.map((speech) => (
        <div key={speech.id} className="bg-white shadow p-5 mb-4 rounded-lg">
          <h3 className="font-semibold text-lg">{speech.title}</h3>

          {speech.audioUrl && (
            <audio controls className="mt-3 w-full">
              <source src={speech.audioUrl} />
            </audio>
          )}
        </div>
      ))}
    </main>
  );
}