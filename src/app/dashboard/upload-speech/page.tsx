"use client";

import { useState } from "react";
import {doc, updateDoc} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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

      // STEP 1: Create Firestore doc FIRST
      const docRef = await addDoc(collection(db, "speeches"), {
        title: title.trim(),
        content: content.trim(),
        userUid: user.uid,
        status: "processing",
        createdAt: serverTimestamp(),
      });

      // STEP 2: Upload audio using SAME docId
      const fileExtension = audioFile.name.split(".").pop();
      const audioRef = ref(storage, `speeches/${docRef.id}.${fileExtension}`);
      const audioSnap = await uploadBytes(audioRef, audioFile);
      const audioUrl = await getDownloadURL(audioSnap.ref);

      // Optional video
      let videoUrl = "";
      if (videoFile) {
        const videoRef = ref(storage, `videos/${docRef.id}.mp4`);
        const videoSnap = await uploadBytes(videoRef, videoFile);
        videoUrl = await getDownloadURL(videoSnap.ref);
      }

      // STEP 3: Update SAME document (CRITICAL)
      const speechDocRef = doc(db, "speeches", docRef.id);
      await updateDoc(speechDocRef, {
        audioUrl,
        videoUrl,
      });

      // Reset form
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

          {/* TITLE */}
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

          {/* TRANSCRIPT */}
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

          {/* AUDIO */}
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

          {/* VIDEO */}
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

          {/* BUTTON */}
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