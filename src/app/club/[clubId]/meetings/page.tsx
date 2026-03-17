"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getClubMeetings } from "../../../../lib/services/clubService";

export default function MeetingsPage() {
  const { clubId } = useParams();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) {
      getClubMeetings(clubId as string).then(data => {
        setMeetings(data);
        setLoading(false);
      });
    }
  }, [clubId]);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upcoming Meetings</h1>
      <div className="space-y-4">
        {meetings.map((m) => (
          <div key={m.id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{m.meetingDate}</p>
              <p className="text-slate-500 text-sm">Agenda: {m.agenda}</p>
            </div>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
              View Roles
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}