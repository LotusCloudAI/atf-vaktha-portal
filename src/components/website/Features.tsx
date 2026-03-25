export default function Features() {
  return (
    <section className="text-center py-16">
      <h2 className="text-2xl font-bold mb-6">
        What is ATF Vaktha?
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-bold mb-2">Leadership</h3>
          <p>Develop leadership skills through structured practice.</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-bold mb-2">Communication</h3>
          <p>Improve speaking and storytelling.</p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="font-bold mb-2">Confidence</h3>
          <p>Build confidence through real-world practice.</p>
        </div>
      </div>
    </section>
  );
}
