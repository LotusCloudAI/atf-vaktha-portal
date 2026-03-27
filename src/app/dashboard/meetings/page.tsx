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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "meetings"));

        const data: Meeting[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Meeting, "id">),
        }));

        if (isMounted) {
          setMeetings(data);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading meetings...</div>;
  }

  return (
    <div className="p-6">
      {meetings.length === 0 ? (
        <p className="text-gray-500 italic">No meetings found.</p>
      ) : (
        meetings.map((m) => (
          <div key={m.id}>
            {m.theme || "No Theme"} - {m.wordOfTheDay || "No Word"}
          </div>
        ))
      )}
    </div>
  );
}