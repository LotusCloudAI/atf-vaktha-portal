"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Speech {
  id: string;
  title?: string;
  status?: string;
  createdAt?: any;
}

export default function SpeechesPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Wait for Firebase auth to initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch speeches once user is available
  useEffect(() => {
    const fetchSpeeches = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "speeches"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Speech, "id">),
        }));

        setSpeeches(data);
      } catch (error) {
        console.error("Error fetching speeches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeeches();
  }, [user]);

  if (loading) {
    return (
      <main className="p-10">
        <p className="text-gray-500">Loading speeches...</p>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">My Speeches</h1>

      {speeches.length === 0 ? (
        <p className="text-gray-500">
          No speeches found. Upload your first speech to get started.
        </p>
      ) : (
        speeches.map((speech) => (
          <div
            key={speech.id}
            className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">
              {speech.title || "Untitled Speech"}
            </h2>

            <p className="text-sm text-gray-600">
              Status: {speech.status || "Pending"}
            </p>
          </div>
        ))
      )}
    </main>
  );
}