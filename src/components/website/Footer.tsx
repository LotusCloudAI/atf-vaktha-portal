import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16 w-full">

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">

        {/* BRAND */}
        <div>
          <h3 className="text-lg font-bold mb-3">ATF Vaktha</h3>
          <p className="text-gray-400">
            Leadership. Communication. Confidence.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/programs">Programs</Link></li>
            <li><Link href="/events">Events</Link></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/resources">Guides</Link></li>
            <li><Link href="/resources">Downloads</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-gray-400 mb-3">support@atfvaktha.org</p>

          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/company/american-telugu-federation"
              target="_blank"
              className="text-gray-400 hover:text-white"
            >
              LinkedIn
            </a>

            <a
              href="#"
              className="text-gray-400 hover:text-white"
            >
              YouTube
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 text-center text-gray-500 text-xs py-4">
        © {new Date().getFullYear()} ATF Vaktha. All rights reserved.
      </div>

    </footer>
  );
}