import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full bg-white">

      {/* ================= HERO SECTION ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Empower Your Voice,<br />Lead with Confidence
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Build leadership and communication skills with ATF Vaktha.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/programs"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Get Started
            </Link>

            <Link
              href="/programs"
              className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition"
            >
              Explore Programs
            </Link>

          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* CARD 1 */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Leadership
              </h3>
              <p className="text-gray-600">
                Develop leadership skills through structured practice.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Communication
              </h3>
              <p className="text-gray-600">
                Improve speaking and storytelling with AI feedback.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Confidence
              </h3>
              <p className="text-gray-600">
                Build confidence through real-world communication practice.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}