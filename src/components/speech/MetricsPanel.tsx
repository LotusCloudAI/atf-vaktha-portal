"use client";

export default function MetricsPanel({ metrics }: any) {
  const words = metrics?.words ?? 0;
  const speed = metrics?.speedWPM ?? 0;
  const filler = metrics?.fillerWords ?? 0;

  return (
    <div className="bg-white p-6 rounded shadow">

      <h2 className="font-bold mb-4">Metrics</h2>

      <div className="grid grid-cols-3 gap-4 text-center">

        {/* WORDS */}
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Words</p>
          <p className="text-xl font-bold text-blue-600">{words}</p>
        </div>

        {/* SPEED */}
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Speed (WPM)</p>
          <p className="text-xl font-bold text-green-600">{speed}</p>
        </div>

        {/* FILLER WORDS */}
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-500">Filler Words</p>
          <p className="text-xl font-bold text-red-600">{filler}</p>
        </div>

      </div>

    </div>
  );
}