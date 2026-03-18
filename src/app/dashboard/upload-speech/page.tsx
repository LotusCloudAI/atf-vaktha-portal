"use client";

import { useState } from "react";
<<<<<<< HEAD
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
=======
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

export default function UploadSpeech() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: any) => {

    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    if (!title) {
      alert("Please enter speech title");
      return;
    }

    setUploading(true);

    try {

      let audioUrl = "";

      if (file) {

        const storage = getStorage();

        const storageRef = ref(
          storage,
          `speeches/${user.uid}/${Date.now()}_${file.name}`
        );

        await uploadBytes(storageRef, file);

        audioUrl = await getDownloadURL(storageRef);

      }

      await addDoc(collection(db, "speeches"), {
        title: title,
        content: content,
        audioUrl: audioUrl,
        userUid: user.uid,
        createdAt: serverTimestamp()
      });

      router.push("/dashboard");

    } catch (error) {

      console.error("Upload failed:", error);

    }

    setUploading(false);

  };

  return (

    <main className="min-h-screen bg-gray-50 p-10">

      <h1 className="text-3xl font-bold text-blue-700">
        Upload New Speech
      </h1>

      <form
        onSubmit={handleUpload}
        className="mt-8 max-w-xl space-y-4"
      >

        <input
          type="text"
          placeholder="Speech Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <textarea
          placeholder="Speech Content (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />

        <button
          type="submit"
          disabled={uploading}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload Speech"}
        </button>

      </form>

>>>>>>> main
    </main>

  );

}