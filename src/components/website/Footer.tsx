import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4 text-sm">

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
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/programs" className="hover:text-white">Programs</Link></li>
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/resources" className="hover:text-white">Guides</Link></li>
            <li><Link href="/resources" className="hover:text-white">Downloads</Link></li>
          </ul>
        </div>

        {/* CONTACT / SOCIAL */}
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-gray-400 mb-3">support@atfvaktha.org</p>

          <div className="flex gap-4 text-gray-400">
            <a
              href="https://www.linkedin.com/company/american-telugu-federation"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              LinkedIn
            </a>

            <a href="#" className="hover:text-white">
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