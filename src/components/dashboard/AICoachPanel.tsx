"use client";

export default function AICoachPanel({ data }: any) {
  if (!data) {
    return <p className="text-gray-400">AI feedback not ready.</p>;
  }

  const improvements =
    data.improvements ||
    data.suggestions ||
    data.weaknesses ||
    [];

  return (
    <div className="bg-white p-5 rounded shadow">

      <h2 className="font-bold mb-3">AI Coach</h2>

      <p className="mb-4 text-gray-700">
        {data.summary || "AI feedback is being generated."}
      </p>

      {data.strengths?.length > 0 && (
        <div className="mb-3">
          <h3 className="font-semibold text-green-600">Strengths</h3>
          <ul className="list-disc ml-5 text-sm">
            {data.strengths.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600">Improvements</h3>
          <ul className="list-disc ml-5 text-sm">
            {improvements.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}