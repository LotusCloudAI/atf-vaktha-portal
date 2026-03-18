"use client";

import { useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function UploadSpeechPage() {
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("User not logged in");
      return;
    }

    if (!title || !audioUrl) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "speeches"), {
        title,
        audioUrl,
        userUid: user.uid,
        createdAt: new Date(),
      });

      setMessage("Speech uploaded successfully");
      setTitle("");
      setAudioUrl("");
    } catch (error) {
      console.error(error);
      setMessage("Error uploading speech");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Upload Speech</h1>

        <input
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          placeholder="Enter Audio URL"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="text-green-600 mt-3">{message}</p>
        )}
      </div>
    </main>
  );
}