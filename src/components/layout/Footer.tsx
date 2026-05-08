export default function Footer() {
  return (
    <footer className="bg-[#0B1A3A] text-white px-8 py-14 mt-20">

      <div className="grid md:grid-cols-4 gap-12">

        {/* About */}
        <div>
          <img
            src="/images/logo/logo-gold-transparent.png"
            alt="ATF Vaktha"
            className="h-16 mb-4 drop-shadow-md"
          />

          <h3 className="font-semibold text-lg mb-2 tracking-wide">
            ATF Vaktha
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed">
            Empowering individuals through leadership,
            communication, and confidence building.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white transition cursor-pointer">About</li>
            <li className="hover:text-white transition cursor-pointer">Programs</li>
            <li className="hover:text-white transition cursor-pointer">Find a Club</li>
            <li className="hover:text-white transition cursor-pointer">Events</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Resources</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white transition cursor-pointer">Downloads</li>
            <li className="hover:text-white transition cursor-pointer">Member Login</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Connect With Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition"
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © 2026 ATF Vaktha. All rights reserved.
      </div>

    </footer>
  );
}