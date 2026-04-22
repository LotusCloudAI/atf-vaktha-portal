"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../../../lib/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { onAuthStateChanged, User } from "firebase/auth";

export default function UploadSpeech() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * WAIT FOR AUTH STATE
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * MAIN UPLOAD FUNCTION
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authLoading) {
      alert("Auth loading. Please wait.");
      return;
    }

    if (!user) {
      alert("Please log in to upload a speech.");
      return;
    }

    // ✅ CRITICAL FIX — ensure Firebase auth token is ready
    await user.getIdToken(true);

    if (!user.uid) {
      alert("User authentication failed. Please login again.");
      return;
    }

    if (!title.trim()) {
      alert("A title is required.");
      return;
    }

    if (!audioFile) {
      alert("Please upload an audio file");
      return;
    }

    setUploading(true);

    try {
      /**
       * STEP 1 — CREATE FIRESTORE DOC
       */
      const docRef = await addDoc(collection(db, "speeches"), {
        title: title.trim(),
        content: content.trim(),
        userUid: user.uid,
        createdAt: serverTimestamp(),
        status: "processing",
      });

      console.log("Doc created:", docRef.id);

      /**
       * STEP 2 — UPLOAD AUDIO (FIXED TEMPLATE STRING)
       */
      const audioExtension = audioFile.name.split(".").pop();
      const audioPath = `speeches/${docRef.id}.${audioExtension}`;
      const audioRef = ref(storage, audioPath);

      await uploadBytes(audioRef, audioFile);
      const audioUrl = await getDownloadURL(audioRef);

      /**
       * STEP 3 — UPLOAD VIDEO (OPTIONAL)
       */
      let videoUrl = "";

      if (videoFile) {
        const videoExtension = videoFile.name.split(".").pop();
        const videoPath = `videos/${docRef.id}.${videoExtension}`;
        const videoRef = ref(storage, videoPath);

        await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoRef);
      }

      /**
       * STEP 4 — UPDATE FIRESTORE
       */
      await updateDoc(docRef, {
        audioUrl,
        videoUrl,
      });

      alert("Upload successful. AI processing started.");
      router.push("/dashboard/analytics");

    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * UI SAFETY — WAIT FOR AUTH
   */
  if (authLoading) {
    return <p className="p-10">Loading user...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700">
          Upload New Speech
        </h1>

        <p className="text-gray-600 mt-2">
          Share your speech and get instant AI feedback.
        </p>

        <form onSubmit={handleUpload} className="mt-8 space-y-6">

          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-3 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Transcript (Optional)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full border p-3 rounded"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Audio Recording
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video Recording
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white font-bold px-6 py-4 rounded-lg disabled:bg-gray-400"
          >
            {uploading ? "Processing & Saving..." : "Upload and Analyze Speech"}
          </button>

        </form>
      </div>
    </main>
  );
}