import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="bg-gray-50 py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Empower Your Voice, Lead with Confidence
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Build leadership and communication skills with ATF Vaktha.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition"
            >
              Get Started
            </Link>

            <Link
              href="/programs"
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-100 transition"
            >
              Explore Programs
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">

          <div>
            <h3 className="text-xl font-semibold mb-3">Leadership</h3>
            <p className="text-gray-600">
              Develop leadership skills through structured practice.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Communication</h3>
            <p className="text-gray-600">
              Improve speaking and storytelling with AI feedback.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Confidence</h3>
            <p className="text-gray-600">
              Build confidence through real-world communication practice.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}