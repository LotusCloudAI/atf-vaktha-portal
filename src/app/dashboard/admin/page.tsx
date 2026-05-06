"use client";

import { useEffect, useState } from "react";
import { useUserRole } from "../../../lib/hooks/useUserRole";
import RoleGuard from "../../../components/saas/RoleGuard";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminPage() {
  const role = useUserRole();
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpeeches = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "speeches"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSpeeches(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speech?")) return;
    
    try {
      await deleteDoc(doc(db, "speeches", id));
      // Local filter for instant UI update
      setSpeeches((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete speech.");
    }
  };

  useEffect(() => {
    fetchSpeeches();
  }, []);

  return (
    <RoleGuard role={role} allowed={["admin", "enterprise_admin"]}>
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500">System-wide speech management</p>
          </div>
          <button 
            onClick={fetchSpeeches}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="animate-pulse text-gray-500">Loading speeches...</p>
          </div>
        ) : speeches.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No speeches available in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {speeches.map((speech) => (
              <div
                key={speech.id}
                className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                      {speech.title || "Untitled Speech"}
                    </h2>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      UID: {speech.userUid}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <audio controls className="w-full h-8 mt-4">
                    <source src={speech.audioUrl} />
                  </audio>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleDelete(speech.id)}
                      className="text-sm bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-1.5 rounded-md transition-all font-medium"
                    >
                      Delete Entry
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </RoleGuard>
  );
}