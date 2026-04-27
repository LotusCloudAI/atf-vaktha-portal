export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 text-center">
      <p className="font-semibold text-lg">ATF Vaktha</p>

      <p className="text-gray-400 mt-2">
        Empowering communication through AI
      </p>

      {/* SOCIAL LINKS CONTAINER */}
      <div className="mt-6 flex justify-center">
        {/* 'gap-x-8' creates a large invisible gap between each link */}
        <div className="flex flex-row gap-x-8 text-sm text-blue-400">
          <a
            href="https://www.linkedin.com/company/american-telugu-federation"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            LinkedIn
          </a>

          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            YouTube
          </a>

          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Instagram
          </a>
        </div>
      </div>

      <p className="text-gray-500 mt-6 text-xs">
        © 2026 ATF Vaktha. All rights reserved.
      </p>
    </footer>
  );
}