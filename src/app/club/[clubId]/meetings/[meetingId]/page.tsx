"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MeetingAgendaPage() {
  const { meetingId } = useParams();
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      // TASK-8: Fetch roles from meetingRoles collection
      const q = query(
        collection(db, "meetingRoles"), 
        where("meetingId", "==", meetingId)
      );
      const snapshot = await getDocs(q);
      setRoles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    if (meetingId) fetchRoles();
  }, [meetingId]);

  return (
    <main className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-3xl mt-10 border border-slate-100">
      <h1 className="text-3xl font-black text-slate-900 mb-8 border-b pb-4">Meeting Agenda</h1>
      
      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{role.roleName}</p>
              <p className="text-lg font-semibold text-slate-800">Member ID: {role.memberId}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-200"></div>
          </div>
        ))}
        
        {roles.length === 0 && (
          <p className="text-center text-slate-400 py-10 italic">Agenda is still being finalized...</p>
        )}
      </div>
    </main>
  );
}