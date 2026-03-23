export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-10 mt-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="font-bold mb-2">ATF Vaktha</h3>
          <p>Leadership. Communication. Confidence.</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Quick Links</h3>
          <p>About</p>
          <p>Programs</p>
          <p>Events</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Resources</h3>
          <p>Guides</p>
          <p>Downloads</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Connect</h3>
          <p>LinkedIn</p>
          <p>YouTube</p>
        </div>
      </div>
    </footer>
  );
}
