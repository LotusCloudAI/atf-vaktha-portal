export default function Benefits() {
  return (
    <section className="py-24 px-6 text-center">

      <h2 className="text-3xl font-bold mb-14">
        What ATF Vaktha Offers
      </h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3">Leadership</h3>
          <p>
            Develop leadership skills through structured practice,
            mentorship, and real-world scenarios.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3">Communication</h3>
          <p>
            Master public speaking, storytelling, and impactful
            communication techniques.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3">Confidence</h3>
          <p>
            Build confidence through continuous feedback,
            practice, and supportive community.
          </p>
        </div>

      </div>

    </section>
  );
}