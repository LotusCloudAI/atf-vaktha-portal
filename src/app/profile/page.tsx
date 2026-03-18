"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          setName(snap.data().name || "");
          setBio(snap.data().bio || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          bio,
        },
        { merge: true } // safer than updateDoc
      );

      setMessage("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving profile");
    }
  };

  if (loading) {
    return (
      <main className="p-10">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="p-10 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      <input
        className="border p-2 w-full"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mt-4"
        placeholder="Short Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        onClick={saveProfile}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Profile
      </button>

      {message && (
        <p className="mt-4 text-green-600">{message}</p>
      )}

    </main>
  );
}