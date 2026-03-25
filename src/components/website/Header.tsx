import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <h1 className="font-bold text-blue-800 text-lg">ATF Vaktha</h1>

      <nav className="hidden md:flex gap-6 text-gray-700">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/programs">Programs</Link>
        <Link href="/clubs">Clubs</Link>
        <Link href="/events">Events</Link>
        <Link href="/resources">Resources</Link>
      </nav>

      <Link
        href="/dashboard"
        className="bg-blue-800 text-white px-4 py-2 rounded"
      >
        Login
      </Link>
    </header>
  );
}
