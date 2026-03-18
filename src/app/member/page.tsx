"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface Speech {
  id: string;
  title?: string;
  status?: string;
  createdAt?: any;
}

export default function MemberPage() {
  const [user, setUser] = useState<User | null>(null);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const q = query(
          collection(db, "speeches"),
          where("userUid", "==", firebaseUser.uid)
        );

        const snapshot = await getDocs(q);

        const data: Speech[] = snapshot.docs.map((doc) => {
          const docData = doc.data() as Omit<Speech, "id">;

          return {
            id: doc.id,
            title: docData.title || "Untitled Speech",
            status: docData.status || "Pending",
            createdAt: docData.createdAt || null,
          };
        });

        setSpeeches(data);
      } catch (error) {
        console.error("Error fetching speeches:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">
        Member Dashboard
      </h1>

      {/* User Info */}
      {user && (
        <div className="mb-6">
          <p className="text-gray-600">
            Welcome,{" "}
            <span className="font-medium">{user.email}</span>
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading your data...</p>
      )}

      {/* Empty State */}
      {!loading && speeches.length === 0 && (
        <p className="text-gray-500">
          No speeches yet. Start by uploading your first speech.
        </p>
      )}

      {/* Speech List */}
      {!loading && speeches.length > 0 && (
        <div className="grid gap-4">
          {speeches.map((speech) => (
            <div
              key={speech.id}
              className="border rounded-lg p-5 shadow-sm bg-white"
            >
              <h2 className="font-semibold text-lg">
                {speech.title}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                Status: {speech.status}
              </p>

              {speech.createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded:{" "}
                  {speech.createdAt?.toDate
                    ? speech.createdAt.toDate().toLocaleString()
                    : "N/A"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}