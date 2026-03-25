"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Speech {
  id: string;
  title?: string;
  audioUrl?: string;
  videoUrl?: string; // Added videoUrl to interface
  createdAt?: any;
  analytics?: {
    words?: number;
    wpm?: number;
    score?: number;
  };
}

export default function SpeechLibrary() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeeches = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "speeches"),
        where("userUid", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const list: Speech[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Speech, "id">),
      }));

      setSpeeches(list);
      setLoading(false);
    };

    fetchSpeeches();
  }, []);

  if (loading) {
    return <p className="p-10 text-center">Loading speeches...</p>;
  }

  return (
    <main className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Speech Library
      </h1>

      {speeches.length === 0 ? (
        <p className="text-gray-500">No speeches uploaded yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {speeches.map((speech) => (
            <div key={speech.id} className="bg-white shadow-sm p-5 border rounded-xl flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                {speech.title || "Untitled Speech"}
              </h3>

              {/* Analytics Display Section */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs mb-4">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Words</p>
                  <p className="font-bold text-gray-700">{speech.analytics?.words || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">WPM</p>
                  <p className="font-bold text-gray-700">{speech.analytics?.wpm || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Score</p>
                  <p className="font-bold text-blue-600">
                    {speech.analytics?.score || 0}%
                  </p>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-4 mt-auto">
                {speech.audioUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Audio Recording</p>
                    <audio controls className="w-full h-8">
                      <source src={speech.audioUrl} />
                    </audio>
                  </div>
                )}

                {speech.videoUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Video Recording</p>
                    <video 
                      controls 
                      src={speech.videoUrl} 
                      className="w-full rounded-lg border border-gray-200 bg-black aspect-video" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}