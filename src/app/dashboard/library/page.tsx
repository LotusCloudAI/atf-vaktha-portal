"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import { auth, db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LibraryPage() {
  const [speeches, setSpeeches] = useState<any[]>([]);
=======
<<<<<<< HEAD
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface Speech {
  id: string;
  title?: string;
  audioUrl?: string;
  createdAt?: any;
}

export default function SpeechLibrary() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
>>>>>>> main
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeeches = async () => {
<<<<<<< HEAD
      const user = auth.currentUser;

      if (!user) return;

      try {
=======
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

>>>>>>> main
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

<<<<<<< HEAD
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
=======
        const list: Speech[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Speech, "id">;

          return {
            id: doc.id,
            title: data.title || "Untitled Speech",
            audioUrl: data.audioUrl || "",
            createdAt: data.createdAt || null,
          };
        });

        setSpeeches(list);
      } catch (error) {
        console.error("Error fetching speeches:", error);
      } finally {
        setLoading(false);
      }
=======
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
>>>>>>> feature/admin-layer
>>>>>>> main
    };

    fetchSpeeches();
  }, []);

  return (
<<<<<<< HEAD
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
=======
<<<<<<< HEAD
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Speech Library
      </h1>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading speeches...</p>
      )}

      {/* Empty */}
      {!loading && speeches.length === 0 && (
        <p className="text-gray-500">
          No speeches available.
        </p>
      )}

      {/* List */}
      {!loading &&
        speeches.map((speech) => (
          <div
            key={speech.id}
            className="bg-white shadow p-5 mb-4 rounded-lg"
          >
            <h3 className="font-semibold text-lg">
              {speech.title}
            </h3>

            {speech.audioUrl && (
              <audio controls className="mt-3 w-full">
                <source src={speech.audioUrl} />
              </audio>
            )}
          </div>
        ))}
=======
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
>>>>>>> feature/admin-layer
>>>>>>> main
    </main>
  );
}