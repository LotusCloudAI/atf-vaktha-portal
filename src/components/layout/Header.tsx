"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-xl font-bold">
        ATF Vaktha
      </Link>

      <div className="flex gap-4 items-center">

        <Link href="/login">
          <span className="cursor-pointer">Login</span>
        </Link>

        <Link href="/login">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Join
          </button>
        </Link>

      </div>

    </header>
  );
}