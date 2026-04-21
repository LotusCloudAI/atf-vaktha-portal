"use client";

import { useState } from "react";
import { db, storage, auth } from "../../../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function UploadSpeech() {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile || !title) {
      alert("Please provide title and audio file");
      return;
    }

    // ✅ WAV VALIDATION (CRITICAL FIX)
    const fileName = audioFile.name.toLowerCase();

      if (
        !fileName.endsWith(".wav") &&
        !fileName.endsWith(".mp3")
      ) {
        alert("Please upload WAV or MP3 file");
        return;
      }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        setLoading(false);
        return;
      }

      // ✅ STEP 1: Create Firestore doc FIRST
      const speechRef = doc(collection(db, "speeches"));
      const docId = speechRef.id;

      // ✅ STEP 2: Upload audio using SAME docId
      const fileExt = audioFile.name.split(".").pop();
      const audioRef = ref(storage, `speeches/${docId}.${fileExt}`);

      await uploadBytes(audioRef, audioFile);

      // ✅ STEP 3: Get URL
      const audioUrl = await getDownloadURL(audioRef);

      // ✅ STEP 4: Save Firestore (ONLY BASIC DATA)
      await setDoc(speechRef, {
        title: title.trim(),
        audioUrl,
        userUid: user.uid,
        createdAt: serverTimestamp(),

        // ⚠️ DO NOT ADD ANALYTICS HERE
        status: "processing",
      });

      alert("Speech uploaded successfully!");

      // reset
      setTitle("");
      setAudioFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Speech</h1>

      <form onSubmit={handleUpload} className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="block mb-2 font-semibold">
            Speech Title
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* AUDIO FILE */}
        <div>
          <label className="block mb-2 font-semibold">
            Upload Audio (.wav or .mp3)
          </label>
          <input
            type="file"
            accept=".wav, .mp3, audio/*"
            onChange={(e) =>
              setAudioFile(e.target.files?.[0] || null)
            }
            required
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload Speech"}
        </button>
      </form>
    </main>
  );
}