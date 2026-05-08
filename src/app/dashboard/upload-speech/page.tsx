"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
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
      alert("Title is required.");
      return;
    }

    if (!audioFile) {
      alert("Audio file is required.");
      return;
    }

    setUploading(true);

    try {
      const storage = getStorage();

      // 🔥 STEP 1: CREATE FIRESTORE DOC FIRST (GET docId)
      const docRef = await addDoc(collection(db, "speeches"), {
        title: title.trim(),
        content: content.trim(),
        userUid: user.uid,
        status: "processing",
        createdAt: serverTimestamp(),
      });

      const docId = docRef.id;

      let audioUrl = "";
      let videoUrl = "";

      // 🔥 STEP 2: UPLOAD AUDIO USING docId
      const audioRef = ref(storage, `speeches/${docId}.wav`);
      const audioSnap = await uploadBytes(audioRef, audioFile);
      audioUrl = await getDownloadURL(audioSnap.ref);

      // Optional Video
      if (videoFile) {
        const videoRef = ref(storage, `videos/${docId}_${videoFile.name}`);
        const videoSnap = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoSnap.ref);
      }

      // 🔥 STEP 3: UPDATE SAME DOC WITH URL
      await updateDoc(docRef, {
        audioUrl,
        videoUrl,
      });

      // Reset
      setTitle("");
      setContent("");
      setAudioFile(null);
      setVideoFile(null);

      alert("Upload successful. AI processing started.");

      router.push("/dashboard");

    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.message || "Upload failed");
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

          <div className="bg-white p-6 rounded-lg border">
            <label className="block text-sm font-semibold mb-2">
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

          <div className="bg-white p-6 rounded-lg border">
            <label className="block text-sm font-semibold mb-2">
              Transcript (Optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border p-3 rounded"
            />
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <label className="block text-sm font-semibold mb-2">
              Audio (Required)
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) =>
                setAudioFile(e.target.files?.[0] || null)
              }
              required
            />
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <label className="block text-sm font-semibold mb-2">
              Video (Optional)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setVideoFile(e.target.files?.[0] || null)
              }
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold"
          >
            {uploading ? "Uploading..." : "Upload Speech"}
          </button>

        </form>
      </div>
    </main>
  );
}