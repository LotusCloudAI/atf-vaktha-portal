"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

// TEMP FRONTEND ANALYTICS (for score)
import { analyzeSpeech } from "@/lib/analytics/analyzeSpeech";

export default function UploadSpeech() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to upload a speech.");
      return;
    }

    if (!title.trim()) {
      alert("A title is required.");
      return;
    }

    if (!audioFile) {
      alert("Audio file is required.");
      return;
    }

    setUploading(true);

    try {
      // ============================
      // STEP 1: CREATE DOCUMENT FIRST
      // ============================
      const speechRef = doc(collection(db, "speeches"));
      const docId = speechRef.id;

      let audioUrl = "";
      let videoUrl = "";

      // ============================
      // STEP 2: UPLOAD AUDIO
      // ============================
      const audioRef = ref(storage, `speeches/${docId}.mp3`);
      const audioSnap = await uploadBytes(audioRef, audioFile);
      audioUrl = await getDownloadURL(audioSnap.ref);

      // ============================
      // STEP 3: UPLOAD VIDEO (optional)
      // ============================
      if (videoFile) {
        const videoRef = ref(storage, `videos/${docId}.mp4`);
        const videoSnap = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoSnap.ref);
      }

      // ============================
      // STEP 4: TEMP ANALYTICS (FRONTEND)
      // ============================
      let analytics;

        if (content && content.trim().length > 10) {
          analytics = analyzeSpeech(content, 60);
        } else {
          // fallback when no transcript
          analytics = {
            score: 75,
            wordCount: 0,
          };
        }

      // ============================
      // STEP 5: SAVE FIRESTORE
      // ============================
      await setDoc(speechRef, {
        title: title.trim(),
        content: content.trim() || "",
        userUid: user.uid,

        audioUrl: audioUrl,
        videoUrl: videoUrl || "",

        filePath: `speeches/${docId}.mp3`,

        // TEMP FIX → so UI shows data immediately
        score: analytics.score || 0,
        wordCount: analytics.wordCount || 0,

        status: "completed",

        createdAt: serverTimestamp(),
      });

      // ============================
      // RESET UI
      // ============================
      setTitle("");
      setContent("");
      setAudioFile(null);
      setVideoFile(null);

      router.push("/dashboard");

    } catch (error: any) {
      console.error("Upload process failed:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700">
          Upload New Speech
        </h1>

        <form onSubmit={handleUpload} className="mt-8 space-y-6">

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <textarea
            placeholder="Transcript (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full border p-3 rounded"
          />

          <input
            type="file"
            accept="audio/*"
            onChange={(e) =>
              setAudioFile(e.target.files?.[0] || null)
            }
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setVideoFile(e.target.files?.[0] || null)
            }
          />

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 rounded"
          >
            {uploading ? "Uploading..." : "Upload Speech"}
          </button>
        </form>
      </div>
    </main>
  );
}