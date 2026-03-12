"use client";

import { useEffect, useState } from "react";

import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setName(snap.data().name || "");
        setBio(snap.data().bio || "");
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      name,
      bio,
    });
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <input
        className="border p-2 mt-4 block"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="border p-2 mt-4 block"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <button
        onClick={saveProfile}
        className="mt-4 px-4 py-2 bg-blue-600 text-white"
      >
        Save
      </button>
    </main>
  );
}