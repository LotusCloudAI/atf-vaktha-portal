"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function UploadSpeechPage() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ✅ Auth check
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

  // ✅ Submit function
  const handleSubmit = async () => {
    if (!title || !audioUrl) {
      alert("Please fill all fields");
      return;
    }

    if (!user) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "speeches"), {
        title,
        audioUrl,
        userUid: user.uid,
        userName: user.displayName || "",
        createdAt: serverTimestamp(),
      });

      alert("Speech uploaded successfully!");

      // Reset
      setTitle("");
      setAudioUrl("");

      // Optional: redirect to library
      router.push("/dashboard/library");
    } catch (error) {
      console.error(error);
      alert("Error uploading speech");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="p-10">Loading...</div>;

  return (

    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Upload Speech
      </h1>

      <p className="mb-6 text-gray-700">
        Welcome, {user?.displayName}
      </p>

      <div className="bg-white shadow rounded-lg p-6 max-w-xl">
        <input
          type="text"
          placeholder="Enter speech title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-3 w-full mb-4 rounded"
        />

        <input
          type="text"
          placeholder="Paste audio URL (MP3)"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          className="border p-3 w-full mb-4 rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </main>

  );
}