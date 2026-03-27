"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Meeting = {
  id: string;
  theme?: string;
  wordOfTheDay?: string;
  [key: string]: any;
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "meetings"));

      const data: Meeting[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMeetings(data);
    };

    load();
  }, []);

  return (
    <div className="p-6">
      {meetings.map((m) => (
        <div key={m.id}>
          {m.theme || "No Theme"} - {m.wordOfTheDay || "No Word"}
        </div>
      ))}
    </div>
  );
}