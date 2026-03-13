"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadSpeech() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    const storage = getStorage();
    const storageRef = ref(storage, `speeches/${user.uid}/${file.name}`);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "speeches"), {
      userUid: user.uid,
      title: file.name,
      status: "uploaded",
      audioUrl: url,
      createdAt: new Date(),
    });
  };

  return (
    <main className="p-10">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-green-600 text-white"
      >
        Upload
      </button>
    </main>
  );
}