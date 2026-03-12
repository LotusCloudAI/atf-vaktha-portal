"use client";

import { useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import SpeechList from "../../../components/speech/speechlist";

export default function SpeechUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const storage = getStorage();

  const handleUpload = async () => {
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    const storageRef = ref(storage, `speeches/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);

    await addDoc(collection(db, "speeches"), {
      userUid: user.uid,
      title: file.name,
      status: "uploaded",
      audioUrl: storageRef.fullPath,
      createdAt: new Date(),
    });

    alert("Speech uploaded successfully");
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Upload Speech</h1>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mt-4"
      />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload
      </button>

      <div className="mt-6">
        <SpeechList />
      </div>
    </main>
  );
}