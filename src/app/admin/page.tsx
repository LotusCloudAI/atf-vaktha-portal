"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("No user logged in");
      } else {
        setUserName(user.displayName || "Admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="p-6">Loading admin...</p>;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <p className="mb-6 text-gray-600">
        Welcome, {userName}
      </p>

      <div className="space-y-4">
        <a href="/admin/users" className="block text-blue-600 underline">
          Manage Users
        </a>

        <a href="/admin/speeches" className="block text-blue-600 underline">
          Manage Speeches
        </a>
      </div>
    </main>
  );
}