"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function DashboardPage() {

  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [speeches, setSpeeches] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      if (!firebaseUser) {
        router.replace("/");
        return;
      }

      setUser(firebaseUser);

      try {

        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", firebaseUser.uid)
        );

        const snapshot = await getDocs(q);

        const speechList = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setSpeeches(speechList);

      } catch (error) {
        console.error("Error loading speeches:", error);
      }

      setChecking(false);

    });

    return () => unsubscribe();

  }, [router]);


  const handleDelete = async (speechId: string) => {

    const confirmDelete = confirm("Are you sure you want to delete this speech?");

    if (!confirmDelete) return;

    try {

      await deleteDoc(doc(db, "speeches", speechId));

      setSpeeches((prev) => prev.filter((speech) => speech.id !== speechId));

    } catch (error) {
      console.error("Delete failed:", error);
    }
  };


  if (checking) {
    return <div className="p-10">Loading...</div>;
  }


  return (

    <main className="min-h-screen bg-gray-50 p-10">

      <h1 className="text-3xl font-bold text-blue-700">
        Member Dashboard
      </h1>

      <p className="mt-4 text-gray-700">
        Welcome, {user?.displayName}
      </p>

      <p className="mt-4 font-semibold">
        Total Speeches:
        <span className="text-blue-600 ml-2">
          {speeches.length}
        </span>
      </p>

      <div className="mt-6">
        <button
          onClick={() => router.push("/dashboard/upload-speech")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload New Speech
        </button>
      </div>


      <div className="mt-10">

        <h2 className="text-xl font-semibold mb-4">
          My Speeches
        </h2>

        {speeches.length === 0 && (
          <p className="text-gray-600">
            No speeches uploaded yet.
          </p>
        )}

        {speeches.map((speech) => (

          <div
            key={speech.id}
            className="bg-white shadow rounded p-5 mb-4"
          >

            <h3 className="text-lg font-semibold text-gray-800">
              {speech.title}
            </h3>

            {/* Speech text preview */}
            {speech.content && (
              <p className="text-gray-600 mt-2">
                {speech.content.substring(0, 150)}...
              </p>
            )}

            {/* Audio player */}
            {speech.audioUrl && (
              <audio controls className="mt-3 w-full">
                <source src={speech.audioUrl} />
              </audio>
            )}

            {/* Created date */}
            {speech.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Created: {speech.createdAt?.toDate?.().toLocaleString?.()}
              </p>
            )}

            <div className="mt-4 flex gap-3">

              <button
                onClick={() =>
                  router.push(`/dashboard/edit-speech/${speech.id}`)
                }
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(speech.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>

  );
}