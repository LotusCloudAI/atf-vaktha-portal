"use client";

export default function ScoreBars({ data }: any) {
  if (!data) return null;

  const metrics = [
    { label: "Clarity", value: data.clarity },
    { label: "Confidence", value: data.confidence },
    { label: "Engagement", value: data.engagement },
  ];

  return (
    <div className="bg-white p-5 rounded shadow mt-4">
      <h2 className="font-bold mb-3">Performance</h2>

      {metrics.map((m, i) =>
        m.value ? (
          <div key={i} className="mb-3">
            <p className="text-sm">{m.label}</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}