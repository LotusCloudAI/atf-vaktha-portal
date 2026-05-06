"use client";

export default function ProgressPanel({ data }: any) {
  if (!data) {
    return (
      <div className="text-gray-400 mb-6">
        No progress data yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded shadow mb-6">

      <h2 className="text-lg font-bold mb-3">Your Progress</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">

        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-bold">{data.totalSpeeches}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Average</p>
          <p className="font-bold">{data.avgScore}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Last</p>
          <p className="font-bold">{data.lastScore}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Trend</p>
          <p className="font-bold capitalize">
            {data.improvementTrend}
          </p>
        </div>

      </div>

    </div>
  );
}
