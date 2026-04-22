"use client";

export default function SectionAnalysis({ data }: any) {
  if (!data?.sections) return null;

  return (
    <div className="bg-white p-5 rounded shadow mt-4">
      <h2 className="font-bold mb-3">Section Analysis</h2>

      {Object.entries(data.sections).map(([key, value]: any) => (
        <div key={key} className="mb-3">
          <h3 className="font-semibold capitalize">{key}</h3>
          <p className="text-sm text-gray-600">{value}</p>
        </div>
      ))}
    </div>
  );
}