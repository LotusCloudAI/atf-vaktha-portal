"use client";

export default function AICoachPanel({ data }: any) {
  if (!data) {
    return <p className="text-gray-400">AI feedback not ready.</p>;
  }

  return (
    <div className="bg-white p-5 rounded shadow">

      <h2 className="font-bold mb-3">AI Coach</h2>

      <p className="mb-4 text-gray-700">
        {data.summary || "No summary available"}
      </p>

      <div className="grid md:grid-cols-2 gap-4">

        {/* STRENGTHS */}
        <div>
          <h3 className="font-semibold">Strengths</h3>
          <ul className="list-disc pl-5">
            {Array.isArray(data.strengths) && data.strengths.length > 0 ? (
              data.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))
            ) : (
              <li>No strengths identified</li>
            )}
          </ul>
        </div>

        {/* IMPROVEMENTS */}
        <div>
          <h3 className="font-semibold">Improvements</h3>
          <ul className="list-disc pl-5">
            {Array.isArray(data.improvements) && data.improvements.length > 0 ? (
              data.improvements.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))
            ) : (
              <li>No improvements suggested</li>
            )}
          </ul>
        </div>

      </div>

      {/* INSIGHTS */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>{data.fillerInsights || "No filler insights"}</p>
        <p>{data.pacingInsights || "No pacing insights"}</p>
        <p>{data.clarityInsights || "No clarity insights"}</p>
      </div>

      {/* SCORE BARS */}
      <div className="mt-4 space-y-2">

        <ScoreBar label="Confidence" value={data.confidenceScore} />
        <ScoreBar label="Structure" value={data.structureScore} />

      </div>

    </div>
  );
}

function ScoreBar({ label, value }: any) {
  const safeValue = value || 0;

  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="bg-green-500 h-2 rounded"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
