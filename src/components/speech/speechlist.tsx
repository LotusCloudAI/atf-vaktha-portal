"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

// Define the structure of a Speech object
interface Speech {
  id: string;
  title: string;
  status: string;
  createdAt: any;
}

export default function SpeechList() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);

  useEffect(() => {
    const fetchSpeeches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Create the query (Getting user-specific speeches)
      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      // 2. Fetch the data
      const snapshot = await getDocs(q);
      
      // 3. Map the data to our state
      setSpeeches(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Speech)));
    };

    fetchSpeeches();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Speeches</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speech Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {speeches.map((speech) => (
              <tr key={speech.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{speech.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {speech.createdAt?.toDate ? speech.createdAt.toDate().toLocaleDateString() : "Pending..."}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {speech.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {speeches.length === 0 && (
          <p className="p-6 text-center text-gray-500">No speeches found.</p>
        )}
      </div>
    </div>
  );
}