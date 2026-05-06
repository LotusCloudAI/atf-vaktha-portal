"use client";

export default function RecommendationsPanel({ data }: any) {
  if (!data) {
    return (
      <div className="text-gray-400 mb-6">
        No recommendations yet.
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-5 rounded shadow mb-6">

      <h2 className="text-lg font-bold mb-3">AI Recommendations</h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <h3 className="font-semibold mb-2">Focus Areas</h3>
          <ul className="list-disc pl-5">
            {data.nextFocus?.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Next Goals</h3>
          <ul className="list-disc pl-5">
            {data.nextGoal?.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
