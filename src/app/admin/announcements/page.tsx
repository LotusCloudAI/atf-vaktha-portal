"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AnnouncementsPage() {
  const [text, setText] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = async () => {
    const snap = await getDocs(collection(db, "announcements"));
    setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const createAnnouncement = async () => {
    await addDoc(collection(db, "announcements"), {
      text,
      createdAt: new Date()
    });

    setText("");
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id:string) => {
    await deleteDoc(doc(db,"announcements",id));
    fetchAnnouncements();
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Announcements</h1>

      <div className="mt-4">
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="border p-2"
          placeholder="Announcement"
        />

        <button
          onClick={createAnnouncement}
          className="ml-2 px-4 py-2 bg-blue-600 text-white"
        >
          Create
        </button>
      </div>

      <div className="mt-6">
        {announcements.map(a=>(
          <div key={a.id} className="border p-4 mt-2 flex justify-between">
            <p>{a.text}</p>

            <button
              onClick={()=>deleteAnnouncement(a.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}