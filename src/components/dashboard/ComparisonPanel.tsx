"use client";

export default function ComparisonPanel({ data }: any) {
  if (!data) {
    return <p className="text-gray-400">No comparison yet.</p>;
  }

  const delta = data.improvementDelta || 0;

  return (
    <div className="bg-white p-5 rounded shadow mt-4">

      <h2 className="font-bold mb-3">Progress Comparison</h2>

      <div className="flex justify-between text-sm">

        <p>Previous: {data.previousScore ?? "-"}</p>

        <p>
          Change:
          <span className={delta >= 0 ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
            {delta}
          </span>
        </p>

      </div>

    </div>
  );
}
