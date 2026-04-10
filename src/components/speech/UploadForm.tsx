"use client";

import { useState } from "react";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;

    const docRef = await addDoc(collection(db, "speeches"), {
      userUid: auth.currentUser.uid,
      status: "uploading",
      createdAt: serverTimestamp(),
    });

    const storageRef = ref(storage, `speeches/${docRef.id}.wav`);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "speeches"), {
      audioUrl: url,
      status: "processing",
    });

    alert("Uploaded successfully");
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 mt-3">
        Upload
      </button>
    </div>
  );
}
