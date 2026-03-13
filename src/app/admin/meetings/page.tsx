"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      const snapshot = await getDocs(collection(db, "meetings"));
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchMeetings();
  }, []);

  const createMeeting = async () => {
    await addDoc(collection(db, "meetings"), {
      title,
      status: "scheduled",
      createdAt: new Date(),
    });

    setTitle("");
    alert("Meeting created");
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Meetings</h1>

      <div className="mt-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2"
          placeholder="Meeting Title"
        />

        <button
          onClick={createMeeting}
          className="ml-2 px-4 py-2 bg-blue-600 text-white"
        >
          Create
        </button>
      </div>

      <div className="mt-6">
        {meetings.map(m => (
          <div key={m.id} className="border p-4 mt-2">
            <p>{m.title}</p>
            <p>Status: {m.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
