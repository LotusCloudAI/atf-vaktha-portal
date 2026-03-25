"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { analyzeSpeech } from "@/lib/analytics/analyzeSpeech";
import { generateFeedback } from "@/lib/analytics/feedback";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

    setUploading(true);

    try {
      const storage = getStorage();
      let audioUrl = "";
      let videoUrl = "";

      if (audioFile) {
        const audioRef = ref(storage, `speeches/${user.uid}/${Date.now()}_${audioFile.name}`);
        const snapshot = await uploadBytes(audioRef, audioFile);
        audioUrl = await getDownloadURL(snapshot.ref);
      }

      if (videoFile) {
        const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}_${videoFile.name}`);
        const snapshot = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(snapshot.ref);
      }

      const analytics = analyzeSpeech(content, 60);
      const feedback = generateFeedback(analytics.score);

      await addDoc(collection(db, "speeches"), {
        title: title.trim(),
        content: content.trim(),
        audioUrl,
        videoUrl,
        analytics,
        feedback,
        userUid: user.uid,
        createdAt: serverTimestamp(),
      });

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
        <h1 className="text-3xl font-bold text-blue-700">Upload New Speech</h1>
        <p className="text-gray-600 mt-2">Share your speech and get instant AI feedback.</p>

        <form onSubmit={handleUpload} className="mt-8 space-y-6">
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g., Graduation Keynote 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Transcript (Optional)</label>
              <textarea
                placeholder="Paste your speech text here for detailed analytics..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Audio Recording</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Video Recording</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-lg transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing & Saving...
              </span>
            ) : (
              "Upload and Analyze Speech"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}