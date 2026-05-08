"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white px-8 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/images/logo/logo-gold-transparent.png"
          alt="ATF Vaktha"
          className="h-12 w-auto drop-shadow-lg"
        />
        <span className="text-xl font-semibold tracking-wide">
          ATF Vaktha
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/" className="hover:text-gray-200 transition">Home</Link>
        <Link href="/about" className="hover:text-gray-200 transition">About</Link>
        <Link href="/programs" className="hover:text-gray-200 transition">Programs</Link>
        <Link href="/clubs" className="hover:text-gray-200 transition">Clubs</Link>
        <Link href="/events" className="hover:text-gray-200 transition">Events</Link>
        <Link href="/resources" className="hover:text-gray-200 transition">Resources</Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="text-sm hover:text-gray-200 transition"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="bg-[#B91C1C] px-5 py-2 rounded-md text-white text-sm font-semibold shadow-md hover:bg-red-700 hover:shadow-lg transition"
        >
          Join Now
        </Link>
      </div>

    </header>
  );
}