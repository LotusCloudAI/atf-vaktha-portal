"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpeeches = async () => {
    try {
      const snapshot = await getDocs(collection(db, "speeches"));

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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "speeches", id));
      fetchSpeeches();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSpeeches();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {loading && <p>Loading...</p>}

      {!loading && speeches.length === 0 && (
        <p>No speeches available</p>
      )}

      {speeches.map((speech) => (
        <div
          key={speech.id}
          className="bg-white shadow-md rounded-xl p-4 mb-4"
        >
          <h2 className="text-lg font-semibold">
            {speech.title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            User: {speech.userUid}
          </p>

          <audio controls className="w-full mt-2">
            <source src={speech.audioUrl} />
          </audio>

          <button
            onClick={() => handleDelete(speech.id)}
            className="bg-red-600 text-white px-3 py-1 rounded mt-3"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
