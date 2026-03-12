"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SpeechesPage() {
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
      setSpeeches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchSpeeches();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">My Speeches</h1>
      {speeches.map((speech) => (
        <div key={speech.id} className="border p-4 mt-4">
          <h2 className="font-semibold">{speech.title}</h2>
          <p>Status: {speech.status}</p>
        </div>
      ))}
    </main>
  );
}