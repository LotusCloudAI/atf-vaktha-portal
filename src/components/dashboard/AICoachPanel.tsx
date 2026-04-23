"use client";

export default function AICoachPanel({ data }: any) {
  if (!data?.aiFeedback) {
    return (
      <div className="bg-white p-5 rounded shadow mt-4">
        <h2 className="font-bold mb-3">AI Coach</h2>
        <p className="text-gray-400">AI feedback not available yet.</p>
      </div>
    );
  }

  const { strengths = [], suggestions = [], weaknesses = [] } = data.aiFeedback;

  return (
    <div className="bg-white p-5 rounded shadow mt-4">

      <h2 className="font-bold mb-4 text-lg">AI Coach</h2>

      {/* Strengths */}
      <div className="mb-4">
        <h3 className="font-semibold text-green-600 mb-2">Strengths</h3>
        {strengths.length ? (
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {strengths.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : <p className="text-gray-400 text-sm">No strengths detected</p>}
      </div>

      {/* Suggestions */}
      <div className="mb-4">
        <h3 className="font-semibold text-blue-600 mb-2">Suggestions</h3>
        {suggestions.length ? (
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {suggestions.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : <p className="text-gray-400 text-sm">No suggestions</p>}
      </div>

      {/* Weaknesses */}
      <div>
        <h3 className="font-semibold text-red-600 mb-2">Weaknesses</h3>
        {weaknesses.length ? (
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {weaknesses.map((w: string, i: number) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        ) : <p className="text-gray-400 text-sm">No weaknesses</p>}
      </div>

    </div>
  );
}