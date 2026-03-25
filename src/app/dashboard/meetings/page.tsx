"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MeetingsPage() {

  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "meetings"));
      setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return (
    <div className="p-6">
      {meetings.map((m:any)=>(
        <div key={m.id}>{m.theme} - {m.wordOfTheDay}</div>
      ))}
    </div>
  );
}