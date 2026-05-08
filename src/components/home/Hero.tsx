export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-[#1E3A8A] to-blue-700 text-white py-28 px-6 text-center">
      
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
        Empower Your Voice, Lead with Confidence
      </h1>

      <p className="max-w-2xl mx-auto text-lg mb-10">
        Build leadership, communication, and confidence through structured
        programs, real practice, and AI-powered feedback.
      </p>

      <div className="flex justify-center gap-4">
        <button className="bg-white text-blue-900 px-6 py-3 rounded font-semibold">
          Join ATF Vaktha
        </button>

        <button className="border border-white px-6 py-3 rounded">
          Explore Programs
        </button>
      </div>

    </section>
  );
}