"use client";

import { useRouter } from "next/navigation";
import { db, storage } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

export default function UploadPage() {
  const router = useRouter();

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // STEP 1: Create Firestore doc FIRST
    const docRef = await addDoc(collection(db, "speeches"), {
      status: "processing",
      createdAt: new Date()
    });

    const fileRef = ref(storage, `speeches/${docRef.id}.wav`);

    // STEP 2: Upload
    await uploadBytes(fileRef, file);

    // STEP 3: Redirect to REAL page
    router.push(`/dashboard/speech/${docRef.id}`);
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Upload Speech
      </h1>

      <input type="file" onChange={handleUpload} />

    </div>
  );
}