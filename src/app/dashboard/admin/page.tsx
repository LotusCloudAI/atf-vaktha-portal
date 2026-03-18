"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        ATF Vaktha Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          href="/clubs"
          className="bg-blue-600 text-white p-6 rounded-lg text-center"
        >
          Manage Clubs
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-green-600 text-white p-6 rounded-lg text-center"
        >
          Speech Analytics
        </Link>

        <Link
          href="/dashboard/speeches"
          className="bg-purple-600 text-white p-6 rounded-lg text-center"
        >
          Speech Uploads
        </Link>

      </div>
    </main>
  );
}